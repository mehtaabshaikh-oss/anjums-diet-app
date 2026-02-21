'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ClientProfile {
  id: string
  name: string
  email: string
  phone: string
  package: string
  start_date: string
  end_date: string
  next_appointment_date: string | null
  client_profiles: {
    age: number
    gender: string
    height_cm: number
    weight_kg: number
    target_weight_kg: number
    chest_cm: number
    waist_cm: number
    hip_cm: number
    thigh_cm: number
    allergies: string
    medical_conditions: string
    dietary_preference: string
    food_dislikes: string
    activity_level: string
    notes: string
  }
  weight_logs: Array<{
    id: number
    weight_kg: number
    logged_date: string
    notes: string
  }>
}

export default function ClientDashboard() {
  const [clientId, setClientId] = useState<string | null>(null)
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const id = localStorage.getItem('client_id')
    if (!id) {
      router.push('/client/login')
      return
    }
    setClientId(id)
    fetchProfile(id)
  }, [router])

  const fetchProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/client/profile?client_id=${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_id')
    localStorage.removeItem('client_name')
    localStorage.removeItem('client_email')
    router.push('/client/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/client/login')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const profileData = profile.client_profiles
  const weightData = profile.weight_logs
    ?.filter(log => log.logged_date) // Filter out logs without dates
    ?.sort((a, b) => new Date(a.logged_date).getTime() - new Date(b.logged_date).getTime())
    .map((log) => {
      const date = new Date(log.logged_date)
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        weight: log.weight_kg,
      }
    }) || []

  const startWeight = profileData?.weight_kg || 0
  const currentWeight = weightData.length > 0 ? weightData[weightData.length - 1].weight : startWeight
  const targetWeight = profileData?.target_weight_kg || 0
  const weightDifference = currentWeight - targetWeight
  const bmi = profileData
    ? ((currentWeight / (profileData.height_cm / 100) ** 2)).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your wellness journey at a glance
          </p>
        </div>

        {/* Nutritionist Contact Card */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👩‍⚕️</span>
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Your Nutritionist</p>
                <p className="text-lg font-bold">Anjum's Diet & Wellness</p>
                <p className="text-sm opacity-75 mt-1">📧 anjumsdiet@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Package</p>
                <p className="text-lg font-bold capitalize">{profile.package}</p>
              </div>
              {profile.next_appointment_date && (
                <div className="border-l border-white/30 pl-4">
                  <p className="text-sm opacity-90 mb-1">Next Session</p>
                  <p className="text-lg font-bold">
                    {new Date(profile.next_appointment_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health Metrics - Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📊</span>
            <h3 className="text-xl font-bold text-gray-900">Health Metrics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Age</p>
              <p className="text-2xl font-bold text-gray-900">{profileData?.age || 'N/A'} <span className="text-sm font-normal text-gray-600">years</span></p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Gender</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{profileData?.gender || 'N/A'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Height</p>
              <p className="text-2xl font-bold text-gray-900">{profileData?.height_cm || 'N/A'} <span className="text-sm font-normal text-gray-600">cm</span></p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">BMI</p>
              <p className="text-2xl font-bold text-gray-900">{bmi}</p>
            </div>
          </div>
        </div>

        {/* Weight Section - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Start, Current & Target Weight */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Weight</p>
                  <p className="text-4xl font-bold text-gray-900">{startWeight} kg</p>
                </div>
                <span className="text-5xl">📝</span>
              </div>
              <p className="text-sm text-gray-500">
                Initial weight when you joined
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Current Weight</p>
                  <p className="text-4xl font-bold">{currentWeight} kg</p>
                </div>
                <span className="text-5xl">🏋️</span>
              </div>
              <p className="text-sm opacity-75">
                {weightData.length > 0 ? `Last updated ${weightData[weightData.length - 1].date}` : 'Same as start weight'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Target Weight</p>
                  <p className="text-4xl font-bold text-primary">{targetWeight} kg</p>
                </div>
                <span className="text-5xl">🎯</span>
              </div>
              <div className="mb-3">
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, 100 - (weightDifference / currentWeight) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {weightDifference > 0
                  ? `${Math.abs(weightDifference).toFixed(1)} kg to reach your goal`
                  : weightDifference < 0
                  ? `You've exceeded your target by ${Math.abs(weightDifference).toFixed(1)} kg`
                  : 'Target achieved! 🎉'}
              </p>
            </div>
          </div>

          {/* Weight Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Trend</h3>
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#4a7c59"
                    strokeWidth={3}
                    dot={{ fill: '#4a7c59', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <span className="text-6xl mb-4 block">📊</span>
                  <p className="text-gray-500">No weight logs yet</p>
                  <p className="text-sm text-gray-400 mt-2">Start tracking to see your progress</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Diet & Preferences - Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🥗</span>
            <h3 className="text-xl font-bold text-gray-900">Diet & Preferences</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Diet Preference</p>
              <p className="text-lg font-semibold text-gray-900 capitalize bg-green-50 px-4 py-3 rounded-lg">
                {profileData?.dietary_preference || 'Not specified'}
              </p>
            </div>
            {profileData?.allergies && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Allergies</p>
                <p className="text-sm text-gray-700 bg-red-50 px-4 py-3 rounded-lg">{profileData.allergies}</p>
              </div>
            )}
            {profileData?.medical_conditions && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Medical Conditions</p>
                <p className="text-sm text-gray-700 bg-yellow-50 px-4 py-3 rounded-lg">{profileData.medical_conditions}</p>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
