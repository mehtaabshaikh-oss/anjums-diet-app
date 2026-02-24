'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DietPlanItem {
  id: number
  meal_type: string
  sequence: number
  item_name: string
  quantity: number
  unit: string
  time?: string | null
  notes: string | null
}

interface DietPlan {
  id: number
  name: string
  description: string
  diet_plan_items: DietPlanItem[]
}

interface LogItem {
  diet_plan_item_id: number
  completed: boolean
  comment: string
}

const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  brunch: '☕',
  lunch: '🍽️',
  snack: '🥜',
  dinner: '🌙',
  supper: '🌃',
}

function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export default function ClientDietPlanPage() {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [logItems, setLogItems] = useState<Map<number, LogItem>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [existingLogDate, setExistingLogDate] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
    fetchDietPlan()
  }, [router])

  const fetchDietPlan = async () => {
    try {
      const response = await fetch(`/api/client/diet-plan`)
      if (response.status === 401) {
        router.push('/client/login')
        return
      }
      if (!response.ok) {
        throw new Error('Failed to fetch diet plan')
      }
      const data = await response.json()
      setDietPlan(data)

      // Initialize log items
      const items = new Map<number, LogItem>()
      data.diet_plan_items?.forEach((item: DietPlanItem) => {
        items.set(item.id, {
          diet_plan_item_id: item.id,
          completed: false,
          comment: '',
        })
      })
      setLogItems(items)
    } catch (err) {
      setError('Failed to load diet plan')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemToggle = (itemId: number) => {
    const item = logItems.get(itemId)
    if (item) {
      const updated = new Map(logItems)
      updated.set(itemId, { ...item, completed: !item.completed })
      setLogItems(updated)
    }
  }

  const handleCommentChange = (itemId: number, comment: string) => {
    const item = logItems.get(itemId)
    if (item) {
      const updated = new Map(logItems)
      updated.set(itemId, { ...item, comment })
      setLogItems(updated)
    }
  }

  const toggleComment = (itemId: number) => {
    setExpandedComments(
      expandedComments.has(itemId)
        ? new Set([...expandedComments].filter((id) => id !== itemId))
        : new Set([...expandedComments, itemId])
    )
  }

  const checkExistingLog = async (date: string) => {
    try {
      const response = await fetch(`/api/client/diet-logs/check?date=${date}`)
      const data = await response.json()
      setExistingLogDate(data.submitted ? date : null)
    } catch (err) {
      console.error('Error checking for existing log:', err)
    }
  }

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    await checkExistingLog(date)
  }

  const handleSubmit = async () => {
    if (!selectedDate) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const items = Array.from(logItems.values())
      const response = await fetch('/api/client/diet-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logged_date: selectedDate,
          items,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit diet log')
      }

      setSuccess('✅ Diet log submitted successfully!')
      setTimeout(() => {
        router.push('/client/history')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
      console.error(err)
    } finally {
      setIsSubmitting(false)
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
          <p className="text-gray-600">Loading your diet plan...</p>
        </div>
      </div>
    )
  }

  if (!dietPlan) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🍽️</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Diet Plan Found</h2>
        <p className="text-gray-600 mb-6">
          Your dietician hasn't created a diet plan for you yet. Check back soon!
        </p>
        <a
          href="/client/dashboard"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Back to Dashboard
        </a>
      </div>
    )
  }

  // Group items by meal type
  const mealGroups = new Map<string, DietPlanItem[]>()
  const mealOrder = ['breakfast', 'brunch', 'lunch', 'snack', 'dinner', 'supper']

  dietPlan.diet_plan_items?.forEach((item) => {
    if (!mealGroups.has(item.meal_type)) {
      mealGroups.set(item.meal_type, [])
    }
    mealGroups.get(item.meal_type)!.push(item)
  })

  const sortedMeals = Array.from(mealGroups.entries()).sort(
    ([a], [b]) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
  )

  const completedCount = Array.from(logItems.values()).filter((item) => item.completed).length
  const totalCount = logItems.size
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const selectedDateObj = new Date(selectedDate + 'T00:00:00')
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8">
      {/* Header with Date Picker */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isToday ? "Today's" : "Your"} Diet Plan 🍽️
          </h1>
          <p className="text-xl font-semibold text-gray-900">
            {selectedDateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Date Picker Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            📅 Select Date to Submit
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          />
          <p className="text-xs text-gray-500 mt-2">
            You can submit logs for today or any past date
          </p>
        </div>

        {/* Existing Log Warning */}
        {existingLogDate && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800">
              ⚠️ You have already submitted logs for this date
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              You cannot resubmit a log for the same date. Please select a different date or contact your nutritionist if you need to update this log.
            </p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Plan Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{dietPlan.name}</h2>
            {dietPlan.description && (
              <p className="text-gray-600 mt-2">{dietPlan.description}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-primary">
              {completedCount}/{totalCount} items
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{completionPercentage}% Complete</p>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-6">
        {sortedMeals.map(([mealType, items]) => (
          <div key={mealType} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Meal Header */}
            <div className="bg-gradient-to-r from-primary-light to-primary-light/50 p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span>{MEAL_EMOJIS[mealType]}</span>
                <span className="capitalize">{mealType}</span>
              </h3>
            </div>

            {/* Meal Items */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => {
                const logItem = logItems.get(item.id)
                const isExpanded = expandedComments.has(item.id)

                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    {/* Item Header */}
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleItemToggle(item.id)}
                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${logItem?.completed
                            ? 'bg-primary border-primary'
                            : 'border-gray-300 hover:border-primary'
                          }`}
                      >
                        {logItem?.completed && (
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
                        )}
                      </button>

                      {/* Item Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4
                              className={`text-lg font-semibold transition-all ${logItem?.completed
                                  ? 'text-gray-400 line-through'
                                  : 'text-gray-900'
                                }`}
                            >
                              {item.item_name}
                            </h4>
                            {item.time && (
                              <p className="text-sm text-gray-500 mt-1">
                                🕐 {formatTime(item.time)}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-medium text-primary bg-primary-light px-3 py-1 rounded-full">
                            {item.quantity} {item.unit}
                          </span>
                        </div>

                        {item.notes && (
                          <p className="text-sm text-gray-500 mb-3">💡 {item.notes}</p>
                        )}

                        {/* Comment Section */}
                        <button
                          onClick={() => toggleComment(item.id)}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mb-3"
                        >
                          {isExpanded ? '📝 Hide Notes' : '📝 Add Notes'}
                        </button>

                        {isExpanded && (
                          <div className="mt-3">
                            <textarea
                              value={logItem?.comment || ''}
                              onChange={(e) => handleCommentChange(item.id, e.target.value)}
                              placeholder="What did you actually eat? (e.g., 'skipped roti, ate a donut instead')"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-t-xl shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || totalCount === 0 || existingLogDate !== null}
          className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all text-lg"
        >
          {isSubmitting
            ? '⏳ Submitting...'
            : existingLogDate !== null
              ? '❌ Already Submitted'
              : `✅ Submit Log for ${selectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          }
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Your completed items will be recorded
        </p>
      </div>
    </div>
  )
}
