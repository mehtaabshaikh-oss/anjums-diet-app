'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ClientDietPlan {
  client_id: number
  client_name: string
  email: string
  phone: string
  status: string
  diet_plans: Array<{
    id: number
    name: string
    active: boolean
  }>
}

interface DietPlansStats {
  total_active_clients: number
  clients_with_active_plans: number
  clients_without_plans: number
  total_diet_plans: number
}

export default function DietPlansOverviewPage() {
  const [clientDietPlans, setClientDietPlans] = useState<ClientDietPlan[]>([])
  const [stats, setStats] = useState<DietPlansStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-plan' | 'without-plan'>('all')
  const router = useRouter()

  useEffect(() => {
    fetchDietPlansData()
  }, [])

  const fetchDietPlansData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/diet-plans-overview')
      if (!response.ok) throw new Error('Failed to fetch diet plans overview')
      const data = await response.json()
      setStats(data.stats)
      setClientDietPlans(data.clients)
    } catch (err) {
      setError('Failed to load diet plans overview')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clientDietPlans.filter((client) => {
    const matchesSearch =
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)

    const matchesFilter = (() => {
      if (filterStatus === 'with-plan') {
        return client.diet_plans.some((plan) => plan.active)
      }
      if (filterStatus === 'without-plan') {
        return client.diet_plans.length === 0 || !client.diet_plans.some((plan) => plan.active)
      }
      return true
    })()

    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <svg className="w-12 h-12 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-600">Loading diet plans overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Active Clients</p>
            <p className="text-4xl font-bold text-gray-900">{stats.total_active_clients}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">With Active Plans</p>
            <p className="text-4xl font-bold text-green-600">{stats.clients_with_active_plans}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Without Plans</p>
            <p className="text-4xl font-bold text-orange-600">{stats.clients_without_plans}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Diet Plans</p>
            <p className="text-4xl font-bold text-blue-600">{stats.total_diet_plans}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-900 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Clients</option>
              <option value="with-plan">With Active Plans</option>
              <option value="without-plan">Without Active Plans</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Diet Plans</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                    No clients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const hasActivePlan = client.diet_plans.some((plan) => plan.active)
                  return (
                    <tr key={client.client_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{client.client_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{client.phone}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {client.status === 'active' ? '✓ Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {client.diet_plans.length === 0 ? (
                          <span className="text-sm text-red-600 font-medium">No plans</span>
                        ) : (
                          <div className="space-y-1">
                            {client.diet_plans.map((plan) => (
                              <div key={plan.id} className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    plan.active ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                />
                                <span className="text-sm">
                                  {plan.name}
                                  {plan.active && <span className="text-green-600 ml-1 font-semibold">(Active)</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/clients/${client.client_id}?tab=diet-plans`)}
                          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Overview</h3>
        <p className="text-sm text-blue-800">
          You have <strong>{stats?.total_active_clients}</strong> active clients. <strong>{stats?.clients_with_active_plans}</strong> of them have active diet plans assigned.
          {stats && stats.clients_without_plans > 0 && (
            <>
              {' '}
              <strong>{stats.clients_without_plans}</strong> clients still need a diet plan assigned.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
