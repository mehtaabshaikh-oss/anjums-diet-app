'use client'

import { useState } from 'react'

interface AppointmentSchedulerProps {
  clientId: string | number
  currentAppointment: string | null
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AppointmentScheduler({
  clientId,
  currentAppointment,
  onSuccess,
  onCancel,
}: AppointmentSchedulerProps) {
  // Split date and time for better UX
  const initDateTime = currentAppointment ? new Date(currentAppointment) : null
  const [date, setDate] = useState(
    initDateTime ? initDateTime.toISOString().split('T')[0] : ''
  )
  const [time, setTime] = useState(
    initDateTime
      ? `${String(initDateTime.getHours()).padStart(2, '0')}:${String(initDateTime.getMinutes()).padStart(2, '0')}`
      : ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Generate 15-minute interval time slots from 8 AM to 8 PM
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = String(hour).padStart(2, '0')
        const m = String(minute).padStart(2, '0')
        const time24 = `${h}:${m}`
        const isPM = hour >= 12
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
        const time12 = `${hour12}:${m} ${isPM ? 'PM' : 'AM'}`
        slots.push({ value: time24, label: time12 })
      }
    }
    return slots
  }
  const timeSlots = generateTimeSlots()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate both date and time are selected
    if (!date || !time) {
      setError('Please select both date and time')
      return
    }

    setIsLoading(true)

    try {
      // Combine date and time into ISO string
      const dateTimeString = `${date}T${time}:00`
      const appointmentDateTime = new Date(dateTimeString)

      const response = await fetch(`/api/admin/clients/${clientId}/appointment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_appointment_date: appointmentDateTime.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to schedule appointment')
        return
      }

      setSuccess('Appointment scheduled successfully!')
      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/clients/${clientId}/appointment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_appointment_date: null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to clear appointment')
      }

      setDate('')
      setTime('')
      setSuccess('Appointment cleared!')
      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (err) {
      setError('Failed to clear appointment')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Appointment</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select time</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentAppointment && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              Current: {new Date(currentAppointment).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {isLoading ? 'Scheduling...' : 'Schedule'}
          </button>
          {currentAppointment && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
