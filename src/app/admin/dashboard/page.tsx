'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Spinner, StatCard, Alert } from '@/components/ui'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Appointment {
  id: string
  name: string
  next_appointment_date: string
}

interface DashboardStats {
  totalClients: number
  activeClients: number
  logsSubmittedToday: number
  upcomingAppointments: number
  appointments: Appointment[]
}

interface AnalyticsData {
  averageWeightLoss: number
  clientsWithProgressData: number
  topPerformers: Array<{ name: string; weightLoss: number }>
  adherenceTrend: Array<{ date: string; adherenceRate: number }>
  revenueByPackage: Array<{ name: string; revenue: number; clients: number }>
  newClientsTrend: Array<{ week: string; newClients: number }>
  newLeadsThisWeek: number
}

const quickActions = [
  {
    title: 'Add New Client',
    description: 'Create and register a new client',
    href: '/admin/clients/new',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    gradient: 'from-primary to-primary-dark',
  },
  {
    title: 'View All Clients',
    description: 'Manage and view client details',
    href: '/admin/clients',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 5H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Diet Logs Dashboard',
    description: 'Track client adherence and submissions',
    href: '/admin/diet-logs-dashboard',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-green-500 to-green-600',
  },
  {
    title: 'View Website',
    description: 'Go to public homepage',
    href: '/',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
    gradient: 'from-gray-500 to-gray-600',
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    logsSubmittedToday: 0,
    upcomingAppointments: 0,
    appointments: [],
  })
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminName, setAdminName] = useState('Admin')
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
    getAdminName()
    fetchAnalytics()
  }, [])

  const getAdminName = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user?.email) {
        setAdminName(data.user.email.split('@')[0])
      }
    } catch (err) {
      console.error('Error fetching admin name:', err)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/dashboard/stats')

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/analytics')

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data: AnalyticsData = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" label="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Greeting */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">{adminName}</span>! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Here's a snapshot of your wellness practice
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert
          variant="danger"
          title="Error"
          description={error}
          onClose={() => setError('')}
        />
      )}

      {/* Stats Grid - 4 cards in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Clients"
          value={stats.totalClients}
          color="primary"
          gradient
          icon={
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20H1v-2a6 6 0 016-6v0" />
            </svg>
          }
        />

        <StatCard
          label="Active Clients"
          value={stats.activeClients}
          color="success"
          gradient
          trend="up"
          trendValue={`+${Math.max(0, stats.activeClients)}`}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {analytics && (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                ₹{(analytics.revenueByPackage.reduce((acc, pkg) => acc + pkg.revenue, 0) / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-blue-700 mt-1">from {analytics.revenueByPackage.reduce((acc, pkg) => acc + pkg.clients, 0)} clients</p>
            </div>

            <Link href="/admin/leads" className="block">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">New Leads</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {analytics.newLeadsThisWeek}
                </p>
                <p className="text-sm text-purple-700 mt-1">this week</p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900">Analytics & Insights</h2>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h3>
              <div className="overflow-y-auto max-h-96 pr-2">
                <div className="space-y-3">
                  {stats.appointments && stats.appointments.length > 0 ? (
                    stats.appointments.map((appointment, index) => {
                      const appointmentDate = new Date(appointment.next_appointment_date)
                      const daysUntil = Math.ceil((appointmentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      const formattedDate = appointmentDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                      const formattedTime = appointmentDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

                      return (
                        <button
                          key={appointment.id}
                          onClick={() => router.push(`/admin/clients/${appointment.id}`)}
                          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md hover:from-blue-100 hover:to-blue-150 transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate hover:underline">{appointment.name}</p>
                              <p className="text-sm text-gray-600">{formattedDate} at {formattedTime}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                            daysUntil === 0 ? 'bg-red-200 text-red-800' :
                            daysUntil === 1 ? 'bg-orange-200 text-orange-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                          </span>
                        </button>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No upcoming appointments</p>
                      <p className="text-sm text-gray-400 mt-2">Schedule appointments with your clients</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Next 7 days of scheduled client appointments</p>
            </div>

            {/* Package Distribution Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Package Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.revenueByPackage} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} label={{ value: 'Number of Clients', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value: any) => `${value} client${value !== 1 ? 's' : ''}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="clients" fill="#4a7c59" radius={[8, 8, 0, 0]} name="Clients">
                    {analytics.revenueByPackage.map((entry, index) => {
                      const colors = ['#d4a843', '#4299e1', '#9333ea']
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">Number of clients by package type</p>
            </div>

            {/* Diet Adherence Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Diet Plan Adherence Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.adherenceTrend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} domain={[0, 100]} label={{ value: 'Adherence (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value: any) => `${value}%`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="adherenceRate"
                    stroke="#4a7c59"
                    strokeWidth={3}
                    dot={{ fill: '#4a7c59', r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Adherence %"
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">Percentage of clients submitting diet logs daily</p>
            </div>

            {/* New Clients Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">New Clients This Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.newClientsTrend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} label={{ value: 'New Clients', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => value}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Bar dataKey="newClients" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">Client acquisition rate over the past 30 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className={`h-full bg-gradient-to-br ${action.gradient} text-white rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-white/20 rounded-lg p-3 group-hover:bg-white/30 transition-all">
                    {action.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Get started</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gradient-to-r from-primary/5 to-primary-dark/5 border border-primary/10 rounded-xl p-6">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">💡 Pro tip:</span> Keep tracking your clients' progress to ensure they're achieving their wellness goals. Regular check-ins and consistent monitoring lead to better results.
        </p>
      </div>
    </div>
  )
}
