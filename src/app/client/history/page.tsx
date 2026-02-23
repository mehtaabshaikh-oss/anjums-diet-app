'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DietLogItem {
  id: number
  diet_plan_item_id: number
  completed: boolean
  comment: string
  diet_plan_items: {
    item_name: string
    quantity: number
    unit: string
    meal_type: string
    time?: string | null
    notes?: string | null
  }
}

interface DietLog {
  id: number
  logged_date: string
  status: string
  submitted_at: string
  diet_log_items: DietLogItem[]
}

export default function ClientHistoryPage() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [logs, setLogs] = useState<DietLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLog, setSelectedLog] = useState<DietLog | null>(null)
  const router = useRouter()

  useEffect(() => {
    const id = localStorage.getItem('client_id')
    if (!id) {
      router.push('/client/login')
      return
    }
    setClientId(id)
    fetchLogs(id)
  }, [router])

  const fetchLogs = async (id: string) => {
    try {
      const response = await fetch(`/api/client/diet-logs?client_id=${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      const data = await response.json()
      setLogs(data || [])
    } catch (err) {
      setError('Failed to load history')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

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
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/client/dashboard')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">📋</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Diet Logs Yet</h2>
        <p className="text-gray-600 mb-6">
          Start tracking your diet by submitting your first daily log!
        </p>
        <a
          href="/client/diet-plan"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Go to Today's Plan
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Submission History 📋</h1>
        <p className="text-gray-600">
          View your past diet log submissions and adherence
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
          <p className="text-3xl font-bold text-primary">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">This Week</p>
          <p className="text-3xl font-bold text-gray-900">
            {
              logs.filter((log) => {
                const [year, month, day] = log.logged_date.split('-').map(Number)
                const logDate = new Date(year, month - 1, day)
                const now = new Date()
                const daysAgo = Math.floor(
                  (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
                )
                return daysAgo < 7
              }).length
            }
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Average Adherence</p>
          <p className="text-3xl font-bold text-primary">
            {logs.length > 0
              ? Math.round(
                  logs.reduce((sum, log) => {
                    const completed = log.diet_log_items?.filter((item) => item.completed)
                      .length || 0
                    const total = log.diet_log_items?.length || 0
                    return sum + (total > 0 ? (completed / total) * 100 : 0)
                  }, 0) / logs.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {logs.map((log) => {
          const completed = log.diet_log_items?.filter((item) => item.completed).length || 0
          const total = log.diet_log_items?.length || 0
          const adherencePercentage =
            total > 0 ? Math.round((completed / total) * 100) : 0
          const [year, month, day] = log.logged_date.split('-').map(Number)
          const logDate = new Date(year, month - 1, day)
          const isToday =
            logDate.toDateString() === new Date().toDateString()

          return (
            <div
              key={log.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
            >
              {/* Log Header */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {logDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h3>
                    {isToday && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        Today
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'submitted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.status === 'submitted' ? '✅ Submitted' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {completed} of {total} items completed
                  </p>
                </div>

                {/* Adherence Badge */}
                <div className="text-right mr-6">
                  <p className="text-2xl font-bold text-primary">{adherencePercentage}%</p>
                  <p className="text-xs text-gray-600">Adherence</p>
                </div>

                {/* Chevron */}
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    selectedLog?.id === log.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {/* Log Details */}
              {selectedLog?.id === log.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {log.diet_log_items && log.diet_log_items.length > 0 ? (
                    <div className="space-y-4">
                      {log.diet_log_items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            {/* Status */}
                            <div className="mt-1">
                              {item.completed ? (
                                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-lg border-2 border-red-300 flex-shrink-0"></div>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="flex-1">
                              <p
                                className={`font-semibold ${
                                  item.completed
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900'
                                }`}
                              >
                                {item.diet_plan_items?.item_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {item.diet_plan_items?.quantity}{' '}
                                {item.diet_plan_items?.unit} •{' '}
                                <span className="capitalize">
                                  {item.diet_plan_items?.meal_type}
                                </span>
                                {item.diet_plan_items?.time && (
                                  <span> • 🕐 {item.diet_plan_items.time}</span>
                                )}
                              </p>

                              {item.diet_plan_items?.notes && (
                                <p className="text-sm text-gray-500 mt-2">
                                  💡 {item.diet_plan_items.notes}
                                </p>
                              )}

                              {item.comment && (
                                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <p className="text-xs font-medium text-yellow-800 mb-1">
                                    Your Note:
                                  </p>
                                  <p className="text-sm text-yellow-700">{item.comment}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No items in this log
                    </p>
                  )}

                  {log.submitted_at && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Submitted on{' '}
                        {new Date(log.submitted_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
