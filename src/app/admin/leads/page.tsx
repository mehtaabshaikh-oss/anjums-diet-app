'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  message: string
  source: string
  status: 'new' | 'contacted' | 'converted' | 'rejected'
  created_at: string
  notes: string | null
}

type SortField = 'created_at' | 'status' | 'source' | 'name'
type SortOrder = 'asc' | 'desc'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'contacted' | 'converted' | 'rejected'>('all')
  const [filterSource, setFilterSource] = useState<'all' | 'contact_form' | 'walkin' | 'whatsapp' | 'email' | 'referral' | 'social_media' | 'other'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    source: 'contact_form' as string,
  })
  const [isCreating, setIsCreating] = useState(false)
  const [sortBy, setSortBy] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/leads')
      if (!response.ok) throw new Error('Failed to fetch leads')
      const data = await response.json()
      setLeads(data)
    } catch (err) {
      setError('Failed to load leads')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createFormData.name,
          email: createFormData.email || null,
          phone: createFormData.phone || null,
          message: createFormData.message,
          source: createFormData.source,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create lead')
      }

      // Reset form and refetch leads
      setCreateFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        source: 'contact_form',
      })
      setShowCreateForm(false)
      await fetchLeads()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead')
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update lead')
      const updatedLead = await response.json()

      setLeads(leads.map(lead => (lead.id === leadId ? updatedLead : lead)))
      if (selectedLead?.id === leadId) {
        setSelectedLead(updatedLead)
      }
    } catch (err) {
      setError('Failed to update lead status')
      console.error(err)
    }
  }

  const addNote = async () => {
    if (!selectedLead || !noteText.trim()) return

    try {
      const response = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: noteText,
        }),
      })

      if (!response.ok) throw new Error('Failed to add note')
      const updatedLead = await response.json()

      setLeads(leads.map(lead => (lead.id === selectedLead.id ? updatedLead : lead)))
      setSelectedLead(updatedLead)
      setNoteText('')
      setShowNoteForm(false)
    } catch (err) {
      setError('Failed to add note')
      console.error(err)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new sort field and default to descending for date, ascending for others
      setSortBy(field)
      setSortOrder(field === 'created_at' ? 'desc' : 'asc')
    }
  }

  const filteredLeads = leads
    .filter(lead => {
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
      const matchesSource = filterSource === 'all' || lead.source === filterSource
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      return matchesStatus && matchesSource && matchesSearch
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      // Handle date sorting
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // String comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <svg
              className="w-12 h-12 text-primary mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">Manage and track potential client inquiries</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
        >
          {showCreateForm ? '✕ Cancel' : '+ Add Lead'}
        </button>
      </div>

      {/* Create Lead Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Create New Lead</h3>
          <form onSubmit={createLead} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.name}
                  onChange={e => setCreateFormData({ ...createFormData, name: e.target.value })}
                  placeholder="Lead name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source *
                </label>
                <select
                  value={createFormData.source}
                  onChange={e => setCreateFormData({ ...createFormData, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="contact_form">Contact Form</option>
                  <option value="walkin">Walk-in</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="phone_call">Phone Call</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={e => setCreateFormData({ ...createFormData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={createFormData.phone}
                  onChange={e => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                required
                value={createFormData.message}
                onChange={e => setCreateFormData({ ...createFormData, message: e.target.value })}
                placeholder="Lead inquiry or notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Lead'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <label className="text-sm text-gray-600 font-medium">Search Leads</label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm text-gray-600 font-medium">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="text-sm text-gray-600 font-medium">Source</label>
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value as any)}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Sources</option>
            <option value="contact_form">Contact Form</option>
            <option value="walkin">Walk-in</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="phone_call">Phone Call</option>
            <option value="referral">Referral</option>
            <option value="social_media">Social Media</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{leads.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">New Leads</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {leads.filter(l => l.status === 'new').length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {leads.length === 0
              ? '0%'
              : Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) + '%'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 font-medium">Contacted</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {leads.filter(l => l.status === 'contacted' || l.status === 'converted').length}
          </p>
        </div>
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p>No leads found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th
                        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {sortBy === 'name' && (
                            <span className="text-primary">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">Email</th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">Phone</th>
                      <th
                        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort('source')}
                      >
                        <div className="flex items-center gap-2">
                          Source
                          {sortBy === 'source' && (
                            <span className="text-primary">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortBy === 'status' && (
                            <span className="text-primary">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-2">
                          Date
                          {sortBy === 'created_at' && (
                            <span className="text-primary">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedLead?.id === lead.id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <p className="font-semibold text-gray-900 whitespace-nowrap">{lead.name}</p>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{lead.email}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{lead.phone}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              lead.source === 'contact_form'
                                ? 'bg-blue-100 text-blue-800'
                                : lead.source === 'email'
                                ? 'bg-purple-100 text-purple-800'
                                : lead.source === 'whatsapp'
                                ? 'bg-green-100 text-green-800'
                                : lead.source === 'phone_call'
                                ? 'bg-orange-100 text-orange-800'
                                : lead.source === 'referral'
                                ? 'bg-pink-100 text-pink-800'
                                : lead.source === 'social_media'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {lead.source.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                              lead.status === 'new'
                                ? 'bg-blue-100 text-blue-800'
                                : lead.status === 'contacted'
                                ? 'bg-yellow-100 text-yellow-800'
                                : lead.status === 'converted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lead Details Panel */}
        {selectedLead && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Lead Details</h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedLead.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  {selectedLead.email}
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="text-lg font-semibold text-gray-900"
                >
                  {selectedLead.phone}
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Source</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{selectedLead.source}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Date Received</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(selectedLead.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Message</p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm">{selectedLead.message}</p>
              </div>
            </div>

            {/* Status Buttons */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {(['new', 'contacted', 'converted', 'rejected'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => updateLeadStatus(selectedLead.id, status)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      selectedLead.status === status
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Convert to Client Button */}
            {selectedLead.status === 'contacted' || selectedLead.status === 'converted' ? (
              <Link href={`/admin/clients/new?name=${encodeURIComponent(selectedLead.name)}&email=${encodeURIComponent(selectedLead.email || '')}&phone=${encodeURIComponent(selectedLead.phone || '')}`}>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg transition-all mb-6">
                  ✨ Convert to Client
                </button>
              </Link>
            ) : null}

            {/* Notes */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Notes</h4>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="text-sm text-primary hover:underline"
                >
                  {showNoteForm ? 'Cancel' : '+ Add Note'}
                </button>
              </div>

              {showNoteForm && (
                <div className="mb-4 space-y-3">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Add internal notes about this lead..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  <button
                    onClick={addNote}
                    className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              )}

              {selectedLead.notes && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">{selectedLead.notes}</p>
                </div>
              )}

              {!selectedLead.notes && !showNoteForm && (
                <p className="text-sm text-gray-500">No notes yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
