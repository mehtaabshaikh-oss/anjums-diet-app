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
  nutritionist?: string
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
  newClientsTrend: Array<{ month: string; newClients: number }>
  newLeadsThisWeek: number
  monthlyRevenue: number
  clientsByNutritionist: Array<{ nutritionist: string; clients: number }>
  revenueByNutritionist: Array<{ nutritionist: string; revenue: number }>
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
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null)
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

      // Fetch user role
      if (data.user?.id) {
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        })
        const roleData = await response.json()
        if (response.ok && roleData.role) {
          setUserRole(roleData.role)
        }
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">{adminName}</span>! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">
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

      {/* ROW 1: Total Clients, Active Clients, New Leads, Scheduled Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients - Clickable */}
        <Link href="/admin/clients" className="block">
          <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-6 border border-primary-dark shadow-sm hover:shadow-md transition-all cursor-pointer h-full hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Clients</p>
              <svg className="w-6 h-6 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{stats.totalClients}</p>
            <p className="text-sm opacity-90 mt-1">View all clients</p>
          </div>
        </Link>

        {/* Active Clients - Clickable */}
        <Link href="/admin/clients" className="block">
          <div className="bg-gradient-to-br from-green-50 to-green-100 text-gray-900 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all cursor-pointer h-full hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Active Clients</p>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.activeClients}</p>
            <p className="text-sm text-green-700 mt-1">currently active</p>
          </div>
        </Link>

        {/* New Leads */}
        <Link href="/admin/leads" className="block">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all cursor-pointer h-full hover:scale-105">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">New Leads</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              {analytics?.newLeadsThisWeek || 0}
            </p>
            <p className="text-sm text-purple-700 mt-1">this week</p>
          </div>
        </Link>

        {/* Scheduled Appointments */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-6 border border-rose-200 shadow-sm hover:shadow-md transition-shadow h-full">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Scheduled Appointments</p>
          <p className="text-3xl font-bold text-rose-900 mt-2">
            {stats.appointments ? stats.appointments.length : 0}
          </p>
          <p className="text-sm text-rose-700 mt-1">next 7 days</p>
        </div>
      </div>

      {/* ROW 2: New Clients This Month, Active Packages, Revenue This Month, Total Revenue */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* New Clients This Month */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">New Clients This Month</p>
            <p className="text-3xl font-bold text-orange-900 mt-2">
              {analytics.newClientsTrend[analytics.newClientsTrend.length - 1]?.newClients || 0}
            </p>
            <p className="text-sm text-orange-700 mt-1">in February</p>
          </div>

          {/* Active Packages */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Active Packages</p>
            <p className="text-3xl font-bold text-emerald-900 mt-2">
              {analytics.revenueByPackage.reduce((acc, pkg) => acc + pkg.clients, 0)}
            </p>
            <p className="text-sm text-emerald-700 mt-1">in current service</p>
          </div>

          {/* Revenue This Month */}
          <div className={`relative bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200 shadow-sm hover:shadow-md transition-shadow ${userRole === 'staff' ? 'blur-sm' : ''}`}>
            <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">Revenue This Month</p>
            <p className="text-3xl font-bold text-cyan-900 mt-2">
              ₹{(analytics.monthlyRevenue / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-cyan-700 mt-1">collected</p>
            {userRole === 'staff' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <div className="bg-white/90 rounded-lg p-3 shadow-lg">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C6.48 1 2 5.48 2 11v8h4v3h2v-3h8v3h2v-3h4v-8c0-5.52-4.48-10-10-10zm0 2c4.41 0 8 3.59 8 8v2h-2v-2c0-3.31-2.69-6-6-6s-6 2.69-6 6v2H4v-2c0-4.41 3.59-8 8-8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Total Revenue */}
          <div className={`relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow ${userRole === 'staff' ? 'blur-sm' : ''}`}>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              ₹{(analytics.revenueByPackage.reduce((acc, pkg) => acc + pkg.revenue, 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-blue-700 mt-1">all time</p>
            {userRole === 'staff' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                <div className="bg-white/90 rounded-lg p-3 shadow-lg">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1C6.48 1 2 5.48 2 11v8h4v3h2v-3h8v3h2v-3h4v-8c0-5.52-4.48-10-10-10zm0 2c4.41 0 8 3.59 8 8v2h-2v-2c0-3.31-2.69-6-6-6s-6 2.69-6 6v2H4v-2c0-4.41 3.59-8 8-8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {analytics && (
        <div className="space-y-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics & Insights</h2>

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
                              <p className="text-xs text-gray-500 capitalize">{appointment.nutritionist ? appointment.nutritionist.replace(/_/g, ' ') : 'Anjum'}</p>
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

            {/* Clients per Nutritionist */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Clients per Nutritionist</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.clientsByNutritionist} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="nutritionist" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} label={{ value: 'Number of Clients', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                  <Bar dataKey="clients" fill="#1b6940" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">Active client distribution by nutritionist</p>
            </div>

            {/* Revenue per Nutritionist - Admin only */}
            {userRole === 'admin' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue per Nutritionist</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenueByNutritionist} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="nutritionist" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#666', fontSize: 12 }} label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value: any) => `₹${(value / 1000).toFixed(1)}k`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Bar dataKey="revenue" fill="#4299e1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">Total revenue generated by each nutritionist</p>
              </div>
            )}

            {/* New Clients by Month */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">New Clients by Month</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.newClientsTrend} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#666', fontSize: 12 }} label={{ value: 'New Clients', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => value}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Bar dataKey="newClients" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">Client acquisition rate over the past 6 months</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className={`h-full bg-gradient-to-br ${action.gradient} text-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md sm:shadow-lg transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl sm:hover:scale-105 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="bg-white/20 rounded-lg p-2 sm:p-3 group-hover:bg-white/30 transition-all">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {action.href === '/admin/clients/new' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                      {action.href === '/admin/clients' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 5H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {action.href === '/admin/diet-logs-dashboard' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                      {action.href === '/' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />}
                    </svg>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-2">{action.title}</h3>
                <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{action.description}</p>
                <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Get started</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
