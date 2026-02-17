'use client'

import { useState, useEffect } from 'react'

interface ClientAdherence {
  client_id: string
  client_name: string
  package: string
  submitted_today: boolean
  submission_time: string | null
  total_items: number
  completed_items: number
  adherence_percentage: number
  status: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'PENDING' | 'SUBMITTED'
  log_id: number | null
}

interface DashboardStats {
  total_clients_with_plans: number
  logs_submitted_today: number
  logs_pending: number
  adherence_percentage_today: number
  average_adherence_week: number
}

export default function DietLogsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [adherenceData, setAdherenceData] = useState<ClientAdherence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'pending' | 'not_submitted'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'adherence' | 'time'>('name')
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null)
  const [logDetails, setLogDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/diet-logs/summary')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setStats(data.stats)
      setAdherenceData(data.adherence)
    } catch (err) {
      setError('Failed to load diet logs dashboard')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogDetails = async (logId: number) => {
    try {
      setIsLoadingDetails(true)
      const response = await fetch(`/api/admin/diet-logs/${logId}`)
      if (!response.ok) throw new Error('Failed to fetch log details')
      const data = await response.json()
      setLogDetails(data)
      setSelectedLogId(logId)
    } catch (err) {
      console.error('Failed to load log details:', err)
      alert('Failed to load log details')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const closeModal = () => {
    setSelectedLogId(null)
    setLogDetails(null)
  }

  const filteredData = (adherenceData || []).filter(item => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'submitted') return item.submitted_today
    if (filterStatus === 'pending') return !item.submitted_today && item.status === 'PENDING'
    if (filterStatus === 'not_submitted') return !item.submitted_today && item.status === 'NEEDS_ATTENTION'
    return true
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'name') return a.client_name.localeCompare(b.client_name)
    if (sortBy === 'adherence') return b.adherence_percentage - a.adherence_percentage
    if (sortBy === 'time') {
      if (!a.submission_time && b.submission_time) return 1
      if (a.submission_time && !b.submission_time) return -1
      if (!a.submission_time && !b.submission_time) return 0
      return new Date(b.submission_time!).getTime() - new Date(a.submission_time!).getTime()
    }
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
          <p className="text-gray-600">Loading diet logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Diet Logs Dashboard</h1>
        <p className="text-gray-600 mt-1">Track client adherence and daily submissions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total Clients */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total_clients_with_plans}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292m0 0H7.465M16.535 9.646H20M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Submitted Today */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Submitted Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.logs_submitted_today}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.logs_pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Today's Adherence */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Today's Adherence</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {stats.adherence_percentage_today}%
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Weekly Average */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Weekly Avg</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats.average_adherence_week}%
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm text-gray-600 font-medium">Filter Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Clients</option>
            <option value="submitted">Submitted Today</option>
            <option value="pending">Pending</option>
            <option value="not_submitted">Not Submitted</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium">Sort By</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="name">Client Name</option>
            <option value="adherence">Adherence %</option>
            <option value="time">Submission Time</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Adherence Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Package</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submission Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items Checked</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Adherence %</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-600">
                    No clients found matching the selected filters.
                  </td>
                </tr>
              ) : (
                sortedData.map(client => (
                  <tr
                    key={client.client_id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{client.client_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                        {client.package}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.submitted_today ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ✓ Yes
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          ✗ No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.submission_time
                        ? new Date(client.submission_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {client.completed_items}/{client.total_items}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              client.adherence_percentage >= 80
                                ? 'bg-green-500'
                                : client.adherence_percentage >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${client.adherence_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">
                          {client.adherence_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          client.status === 'ON_TRACK' || client.status === 'SUBMITTED'
                            ? 'bg-green-100 text-green-800'
                            : client.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {client.log_id ? (
                        <button
                          onClick={() => fetchLogDetails(client.log_id!)}
                          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">No log</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diet Log Details Modal */}
      {selectedLogId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {isLoadingDetails ? (
              <div className="p-12 text-center">
                <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                <p className="text-gray-600">Loading diet log details...</p>
              </div>
            ) : logDetails ? (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Diet Log Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {logDetails.log.client?.name} - {new Date(logDetails.log.logged_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* Stats Summary */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Items</p>
                      <p className="text-3xl font-bold text-gray-900">{logDetails.stats.total_items}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{logDetails.stats.completed_items}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Adherence</p>
                      <p className="text-3xl font-bold text-primary">{logDetails.stats.adherence_percentage}%</p>
                    </div>
                  </div>
                </div>

                {/* Meal Items */}
                <div className="p-6 space-y-6">
                  {Object.keys(logDetails.items_by_meal).length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No items in this diet log</p>
                  ) : (
                    Object.entries(logDetails.items_by_meal).map(([mealType, items]: [string, any]) => (
                      <div key={mealType} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">{mealType}</h3>
                        <div className="space-y-3">
                          {items.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border-2 ${
                                item.completed
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xl ${
                                        item.completed ? 'text-green-600' : 'text-red-600'
                                      }`}
                                    >
                                      {item.completed ? '✓' : '✗'}
                                    </span>
                                    <p className="font-semibold text-gray-900">
                                      {item.item_name} - {item.quantity} {item.unit}
                                    </p>
                                  </div>
                                  {item.notes && (
                                    <p className="text-sm text-gray-600 mt-1 ml-7">
                                      Note: {item.notes}
                                    </p>
                                  )}
                                  {item.comment && (
                                    <div className="mt-2 ml-7 p-3 bg-white rounded border border-gray-200">
                                      <p className="text-sm font-medium text-gray-700">Client Comment:</p>
                                      <p className="text-sm text-gray-900 mt-1">{item.comment}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                  <button
                    onClick={closeModal}
                    className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
