'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import AppointmentScheduler from '@/components/AppointmentScheduler'

interface ClientData {
  id: string | number
  name: string
  email: string
  phone: string
  package: string
  duration_months?: number
  start_date: string
  end_date: string
  next_appointment_date: string | null
  status: string
  nutritionist?: string
  client_profiles: any
  weight_logs?: Array<{
    id: string
    logged_date: string
    weight_kg: number
    created_at: string
  }>
  measurements_logs?: Array<{
    id: string
    logged_date: string
    chest_cm: number | null
    waist_cm: number | null
    hip_cm: number | null
    thigh_cm: number | null
    notes: string | null
    created_at: string
  }>
}

interface DietPlan {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
}

interface DietPlanItem {
  id: string
  meal_type: string
  sequence: number
  item_name: string
  quantity: number
  unit: string
  time: string | null
  notes: string | null
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [client, setClient] = useState<ClientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Get tab from URL query param, default to 'profile'
  const initialTab = searchParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false)

  // Diet Plans states
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([])
  const [dietPlanItems, setDietPlanItems] = useState<{ [key: string]: DietPlanItem[] }>({})
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)
  const [dietPlansLoading, setDietPlansLoading] = useState(false)

  // Weight tracking states
  const [showAddWeight, setShowAddWeight] = useState(false)
  const [weightFormData, setWeightFormData] = useState({
    weight_kg: '',
    logged_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [submittingWeight, setSubmittingWeight] = useState(false)
  const [weightError, setWeightError] = useState('')

  // Measurements tracking states
  const [showAddMeasurements, setShowAddMeasurements] = useState(false)
  const [measurementsFormData, setMeasurementsFormData] = useState({
    chest_cm: '',
    waist_cm: '',
    hip_cm: '',
    thigh_cm: '',
    logged_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [submittingMeasurements, setSubmittingMeasurements] = useState(false)
  const [measurementsError, setMeasurementsError] = useState('')

  // Diet logs states
  const [dietLogs, setDietLogs] = useState<any[]>([])
  const [dietLogsLoading, setDietLogsLoading] = useState(false)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  // Notes states
  const [notes, setNotes] = useState<any[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [notesError, setNotesError] = useState('')

  // Payments states
  const [payments, setPayments] = useState<any[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    status: 'paid',
    notes: '',
  })
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [paymentsError, setPaymentsError] = useState('')

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    email: '',
    phone: '',
    package: '',
    duration_months: '',
    status: '',
    start_date: '',
    end_date: '',
    nutritionist: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    target_weight_kg: '',
    allergies: '',
    medical_conditions: '',
    dietary_preference: '',
    chest_cm: '',
    waist_cm: '',
    hip_cm: '',
    thigh_cm: '',
  })
  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [profileEditError, setProfileEditError] = useState('')

  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null)
  const [isDeletingClient, setIsDeletingClient] = useState(false)

  const clientId = params.id as string | number

  useEffect(() => {
    if (clientId) {
      fetchClientData()
      fetchUserRole()
    }
  }, [clientId])

  useEffect(() => {
    if (activeTab === 'diet-plans' && clientId) {
      fetchDietPlans()
    }
    if (activeTab === 'notes' && clientId) {
      fetchNotes()
    }
    if (activeTab === 'payments' && clientId) {
      fetchPayments()
    }
    if (activeTab === 'logs' && clientId) {
      fetchDietLogs()
    }
    if (activeTab === 'profile' && clientId) {
      // Fetch recent payments for profile summary
      fetchPayments()
    }
  }, [activeTab, clientId])

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch client')
      }
      const data = await response.json()
      setClient(data)
    } catch (err) {
      setError('Failed to load client details')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserRole = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
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
      console.error('Failed to fetch user role:', err)
    }
  }

  const handleDeleteClient = async () => {
    if (!confirm('CRITICAL WARNING: Are you sure you want to completely delete this client? This cannot be undone and will erase all their logs, plans, and history.')) {
      return
    }

    try {
      setIsDeletingClient(true)
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete client')
      }

      // Automatically redirect away on success
      router.push('/admin/clients')
    } catch (err: any) {
      alert(err.message || 'Failed to delete client')
      console.error(err)
      setIsDeletingClient(false)
    }
  }

  const fetchDietPlans = async () => {
    try {
      setDietPlansLoading(true)
      const response = await fetch(`/api/admin/diet-plans?client_id=${clientId}`)
      if (!response.ok) throw new Error('Failed to fetch diet plans')
      const plans = await response.json()
      setDietPlans(plans)

      // Fetch items for each plan
      for (const plan of plans) {
        const itemsResponse = await fetch(`/api/admin/diet-plans/${plan.id}/items`)
        if (itemsResponse.ok) {
          const items = await itemsResponse.json()
          setDietPlanItems((prev) => ({ ...prev, [plan.id]: items }))
        }
      }
    } catch (err) {
      console.error('Error fetching diet plans:', err)
    } finally {
      setDietPlansLoading(false)
    }
  }

  const handleArchivePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to archive this diet plan? It will no longer be active.')) return

    try {
      const response = await fetch(`/api/admin/diet-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      })
      if (!response.ok) throw new Error('Failed to archive')
      await fetchDietPlans()
    } catch (err) {
      console.error('Error archiving plan:', err)
    }
  }

  const generateDietPlanPDF = async (plan: any, items: any[], clientName: string) => {
    try {
      // Create a temporary container for HTML to PDF conversion
      const element = document.createElement('div')
      element.style.padding = '40px'
      element.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      element.style.backgroundColor = 'white'
      element.style.width = '800px'
      element.style.lineHeight = '1.6'

      // Build HTML content
      let html = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1b6940; padding-bottom: 30px;">
          <h1 style="color: #1b6940; margin: 0 0 5px 0; font-size: 32px; font-weight: bold;">Anjum's Diet & Wellness</h1>
          <p style="color: #666; margin: 0; font-size: 14px;">Diet & Wellness Solutions</p>
        </div>

        <div style="margin-bottom: 30px; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 30%;"><strong>Client Name:</strong></td>
              <td style="padding: 8px 0;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Plan Name:</strong></td>
              <td style="padding: 8px 0;">${plan.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Description:</strong></td>
              <td style="padding: 8px 0;">${plan.description || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Status:</strong></td>
              <td style="padding: 8px 0;"><span style="color: ${plan.active ? '#16a34a' : '#6b7280'}; font-weight: bold;">${plan.active ? '✓ Active' : '○ Inactive'}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Generated on:</strong></td>
              <td style="padding: 8px 0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 30px;">
          <h2 style="color: #1b6940; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #1b6940; padding-bottom: 10px; font-weight: bold;">Diet Plan Items</h2>
      `

      // Group items by meal type
      const mealGroups: { [key: string]: any[] } = {}
      items.forEach(item => {
        if (!mealGroups[item.meal_type]) {
          mealGroups[item.meal_type] = []
        }
        mealGroups[item.meal_type].push(item)
      })

      // Add meals to HTML with improved formatting
      Object.keys(mealGroups).forEach(mealType => {
        html += `<h3 style="color: #333; font-size: 16px; margin-top: 25px; margin-bottom: 12px; text-transform: capitalize; font-weight: bold; border-left: 4px solid #1b6940; padding-left: 10px;">${mealType}</h3><table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">`
        html += '<tr style="background-color: #1b6940; color: white;"><th style="padding: 12px; text-align: left; font-weight: bold;">Item</th><th style="padding: 12px; text-align: center; font-weight: bold;">Quantity</th><th style="padding: 12px; text-align: left; font-weight: bold;">Notes</th></tr>'

        mealGroups[mealType].forEach((item, idx) => {
          const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
          html += `<tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${item.item_name}</td>
            <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity} ${item.unit}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #666; font-size: 13px;">${item.notes || '—'}</td>
          </tr>`
        })

        html += '</table>'
      })

      html += `
        </div>
        <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 13px; text-align: center; line-height: 1.8;">
          <p style="margin: 0;"><strong>Important Guidelines:</strong></p>
          <p style="margin: 5px 0;">This diet plan is personalized for ${clientName}. Please follow the plan as recommended by your nutritionist.</p>
          <p style="margin: 10px 0; font-size: 12px;">Contact: anjumsdiet@gmail.com | Phone: +91 93262 30557</p>
        </div>
      `

      element.innerHTML = html
      document.body.appendChild(element)

      // Convert HTML to canvas, then to PDF
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210 - 20 // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 10 // Top margin

      // Add image to PDF, handling multiple pages if needed
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= 297 - 20 // A4 height minus margins

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= 297 - 20
      }

      // Download the PDF
      pdf.save(`${clientName}_${plan.name.replace(/\s+/g, '_')}.pdf`)

      // Clean up
      document.body.removeChild(element)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF')
    }
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    setWeightError('')

    if (!weightFormData.weight_kg) {
      setWeightError('Please enter a weight')
      return
    }

    try {
      setSubmittingWeight(true)
      const response = await fetch(`/api/admin/clients/${clientId}/weight-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: parseFloat(weightFormData.weight_kg),
          logged_date: weightFormData.logged_date,
          notes: weightFormData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record weight')
      }

      // Refresh client data to get updated weight logs
      await fetchClientData()
      setWeightFormData({
        weight_kg: '',
        logged_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      setShowAddWeight(false)
    } catch (err: any) {
      setWeightError(err.message || 'Failed to add weight')
      console.error(err)
    } finally {
      setSubmittingWeight(false)
    }
  }

  const handleAddMeasurements = async (e: React.FormEvent) => {
    e.preventDefault()
    setMeasurementsError('')

    // Check if at least one measurement is entered
    const hasAnyMeasurement = measurementsFormData.chest_cm || measurementsFormData.waist_cm ||
      measurementsFormData.hip_cm || measurementsFormData.thigh_cm

    if (!hasAnyMeasurement) {
      setMeasurementsError('Please enter at least one measurement')
      return
    }

    try {
      setSubmittingMeasurements(true)
      const response = await fetch(`/api/admin/clients/${clientId}/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chest_cm: measurementsFormData.chest_cm ? parseFloat(measurementsFormData.chest_cm) : null,
          waist_cm: measurementsFormData.waist_cm ? parseFloat(measurementsFormData.waist_cm) : null,
          hip_cm: measurementsFormData.hip_cm ? parseFloat(measurementsFormData.hip_cm) : null,
          thigh_cm: measurementsFormData.thigh_cm ? parseFloat(measurementsFormData.thigh_cm) : null,
          logged_date: measurementsFormData.logged_date,
          notes: measurementsFormData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to record measurements')
      }

      // Refresh client data
      await fetchClientData()
      setMeasurementsFormData({
        chest_cm: '',
        waist_cm: '',
        hip_cm: '',
        thigh_cm: '',
        logged_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      setShowAddMeasurements(false)
    } catch (err: any) {
      setMeasurementsError(err.message || 'Failed to add measurements')
      console.error(err)
    } finally {
      setSubmittingMeasurements(false)
    }
  }

  const fetchNotes = async () => {
    try {
      setNotesLoading(true)
      const response = await fetch(`/api/admin/clients/${clientId}/notes`)
      if (!response.ok) throw new Error('Failed to fetch notes')
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setNotesError('Failed to load notes')
      console.error(err)
    } finally {
      setNotesLoading(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return

    try {
      setSubmittingNote(true)
      setNotesError('')
      const response = await fetch(`/api/admin/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNoteContent }),
      })

      if (!response.ok) throw new Error('Failed to add note')

      setNewNoteContent('')
      await fetchNotes()
    } catch (err: any) {
      setNotesError(err.message || 'Failed to add note')
      console.error(err)
    } finally {
      setSubmittingNote(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true)
      const response = await fetch(`/api/admin/clients/${clientId}/payments`)
      if (!response.ok) throw new Error('Failed to fetch payments')
      const data = await response.json()
      setPayments(data)
    } catch (err) {
      setPaymentsError('Failed to load payments')
      console.error(err)
    } finally {
      setPaymentsLoading(false)
    }
  }

  const fetchDietLogs = async () => {
    try {
      setDietLogsLoading(true)
      const response = await fetch(`/api/admin/clients/${clientId}/diet-logs`)
      if (!response.ok) throw new Error('Failed to fetch diet logs')
      const data = await response.json()
      setDietLogs(data)
    } catch (err) {
      console.error('Error fetching diet logs:', err)
    } finally {
      setDietLogsLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmittingPayment(true)
      setPaymentsError('')

      const url = editingPaymentId
        ? `/api/admin/clients/${clientId}/payments/${editingPaymentId}`
        : `/api/admin/clients/${clientId}/payments`
      const method = editingPaymentId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save payment')
      }

      setPaymentForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        status: 'paid',
        notes: '',
      })
      setEditingPaymentId(null)
      setShowPaymentForm(false)
      await fetchPayments()
    } catch (err: any) {
      setPaymentsError(err.message || 'Failed to save payment')
      console.error('Payment error:', err)
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleEditPayment = (payment: any) => {
    setEditingPaymentId(payment.id)
    setPaymentForm({
      amount: payment.amount.toString(),
      date: payment.date,
      method: payment.method,
      status: payment.status,
      notes: payment.notes || '',
    })
    setShowPaymentForm(true)
  }

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const response = await fetch(`/api/admin/clients/${clientId}/payments/${paymentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment')

      await fetchPayments()
    } catch (err: any) {
      setPaymentsError(err.message || 'Failed to delete payment')
      console.error(err)
    }
  }

  const handleEditProfile = () => {
    if (!client) return

    if (isEditingProfile) {
      // Cancel edit - don't save
      setIsEditingProfile(false)
      return
    }

    // Initialize edit form with current data
    const profile = client.client_profiles
    setEditFormData({
      email: client.email || '',
      phone: client.phone || '',
      package: client.package || '',
      duration_months: client.duration_months?.toString() || '',
      status: client.status || '',
      start_date: client.start_date || '',
      end_date: client.end_date || '',
      nutritionist: (client as any).nutritionist || 'anjum',
      age: profile?.age?.toString() || '',
      gender: profile?.gender || '',
      height_cm: profile?.height_cm?.toString() || '',
      weight_kg: profile?.weight_kg?.toString() || '',
      target_weight_kg: profile?.target_weight_kg?.toString() || '',
      allergies: profile?.allergies || '',
      medical_conditions: profile?.medical_conditions || '',
      dietary_preference: profile?.dietary_preference || '',
      chest_cm: profile?.chest_cm?.toString() || '',
      waist_cm: profile?.waist_cm?.toString() || '',
      hip_cm: profile?.hip_cm?.toString() || '',
      thigh_cm: profile?.thigh_cm?.toString() || '',
    })
    setIsEditingProfile(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileEditError('')

    try {
      setSubmittingProfile(true)
      const response = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editFormData.email,
          phone: editFormData.phone,
          package: editFormData.package,
          duration_months: editFormData.duration_months ? parseInt(editFormData.duration_months) : null,
          status: editFormData.status,
          start_date: editFormData.start_date,
          end_date: editFormData.end_date,
          nutritionist: editFormData.nutritionist || null,
          age: editFormData.age ? parseInt(editFormData.age) : null,
          gender: editFormData.gender || null,
          height_cm: editFormData.height_cm ? parseFloat(editFormData.height_cm) : null,
          weight_kg: editFormData.weight_kg ? parseFloat(editFormData.weight_kg) : null,
          target_weight_kg: editFormData.target_weight_kg ? parseFloat(editFormData.target_weight_kg) : null,
          allergies: editFormData.allergies || null,
          medical_conditions: editFormData.medical_conditions || null,
          dietary_preference: editFormData.dietary_preference || null,
          chest_cm: editFormData.chest_cm ? parseFloat(editFormData.chest_cm) : null,
          waist_cm: editFormData.waist_cm ? parseFloat(editFormData.waist_cm) : null,
          hip_cm: editFormData.hip_cm ? parseFloat(editFormData.hip_cm) : null,
          thigh_cm: editFormData.thigh_cm ? parseFloat(editFormData.thigh_cm) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      // Refresh client data
      await fetchClientData()
      setIsEditingProfile(false)
    } catch (err: any) {
      setProfileEditError(err.message || 'Failed to update profile')
      console.error(err)
    } finally {
      setSubmittingProfile(false)
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
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Client not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Go Back
        </button>
      </div>
    )
  }

  // Extract profile - client_profiles is a single object, not an array
  // (the API converts the array to a single object)
  const profile = client?.client_profiles

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-600 mt-1">{client.email}</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${client.status === 'active' ? 'bg-green-100 text-green-800' :
            client.status === 'expired' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {client.status}
          </span>
          {userRole === 'admin' && (
            <button
              onClick={handleDeleteClient}
              disabled={isDeletingClient}
              title="Delete this client permanently"
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {isDeletingClient ? (
                <span className="w-5 h-5 flex animate-spin shrink-0">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Appointment Card */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Next Appointment</p>
            {client.next_appointment_date ? (
              <p className="text-2xl font-bold">
                {new Date(client.next_appointment_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : (
              <p className="text-2xl font-bold">Not Scheduled</p>
            )}
          </div>
          <button
            onClick={() => setShowAppointmentScheduler(!showAppointmentScheduler)}
            className="px-6 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            {showAppointmentScheduler ? 'Hide Scheduler' : 'Schedule'}
          </button>
        </div>
      </div>

      {/* Appointment Scheduler */}
      {showAppointmentScheduler && (
        <div className="max-w-md">
          <AppointmentScheduler
            clientId={clientId}
            currentAppointment={client.next_appointment_date}
            onSuccess={() => {
              fetchClientData()
              setShowAppointmentScheduler(false)
            }}
            onCancel={() => setShowAppointmentScheduler(false)}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('diet-plans')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'diet-plans'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Diet Plans
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payments'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'progress'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Progress
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'notes'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'logs'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Logs
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Edit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleEditProfile}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors ${isEditingProfile
                ? 'bg-gray-400 text-white hover:bg-gray-500'
                : 'bg-primary text-white hover:bg-primary-dark'
                }`}
            >
              {isEditingProfile ? 'Cancel Edit' : '✎ Edit Profile'}
            </button>
          </div>

          {profileEditError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{profileEditError}</p>
            </div>
          )}

          {/* Row 1: Contact Info & Membership Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-lg  transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                </div>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="text-lg font-semibold text-gray-900">{client.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Details */}
            <div className="relative bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-lg  transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Membership Details</h3>
                </div>
                {isEditingProfile ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                      <select
                        value={editFormData.package}
                        onChange={(e) => setEditFormData({ ...editFormData, package: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="gold">Gold</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="platinum">Platinum</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <select
                        value={editFormData.duration_months}
                        onChange={(e) => setEditFormData({ ...editFormData, duration_months: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                        <option value="12">12 Months (1 Year)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editFormData.status || client.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={editFormData.start_date}
                        onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={editFormData.end_date}
                        onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Nutritionist</label>
                      <select
                        value={editFormData.nutritionist}
                        onChange={(e) => setEditFormData({ ...editFormData, nutritionist: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="anjum">Anjum</option>
                        <option value="nutritionist_1">Nutritionist 1</option>
                        <option value="nutritionist_2">Nutritionist 2</option>
                        <option value="nutritionist_3">Nutritionist 3</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Package</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{client.package}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {client.duration_months} {client.duration_months === 12 ? 'Months (1 Year)' : 'Months'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${client.status === 'active' ? 'bg-green-100 text-green-800' :
                        client.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {client.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(client.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">End Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(client.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Assigned Nutritionist</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {(client as any).nutritionist ? (client as any).nutritionist.replace(/_/g, ' ') : 'Anjum'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Health Metrics & Body Measurements */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Health Metrics */}
            {profile && (
              <div className="relative bg-gradient-to-br from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Health Metrics</h3>
                  </div>
                  {isEditingProfile ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
                        <input
                          type="number"
                          value={editFormData.age}
                          onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          value={editFormData.gender}
                          onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.height_cm}
                          onChange={(e) => setEditFormData({ ...editFormData, height_cm: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.weight_kg}
                          onChange={(e) => setEditFormData({ ...editFormData, weight_kg: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.target_weight_kg}
                          onChange={(e) => setEditFormData({ ...editFormData, target_weight_kg: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Age</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.age || '−'} {profile.age ? 'years' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Gender</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{profile.gender || '−'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Height</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.height_cm || '−'} {profile.height_cm ? 'cm' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Start Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.weight_kg || '−'} {profile.weight_kg ? 'kg' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Target Weight</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.target_weight_kg || '−'} {profile.target_weight_kg ? 'kg' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">BMI</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {profile.height_cm && profile.weight_kg
                            ? (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1)
                            : '−'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Body Measurements */}
            {profile && (
              <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm border border-purple-100 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Body Measurements</h3>
                  </div>
                  {isEditingProfile ? (
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chest (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.chest_cm}
                          onChange={(e) => setEditFormData({ ...editFormData, chest_cm: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Waist (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.waist_cm}
                          onChange={(e) => setEditFormData({ ...editFormData, waist_cm: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hip (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.hip_cm}
                          onChange={(e) => setEditFormData({ ...editFormData, hip_cm: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thigh (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editFormData.thigh_cm}
                          onChange={(e) => setEditFormData({ ...editFormData, thigh_cm: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Chest</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.chest_cm || '−'} {profile.chest_cm ? 'cm' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Waist</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.waist_cm || '−'} {profile.waist_cm ? 'cm' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Hip</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.hip_cm || '−'} {profile.hip_cm ? 'cm' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Thigh</p>
                        <p className="text-lg font-semibold text-gray-900">{profile.thigh_cm || '−'} {profile.thigh_cm ? 'cm' : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Diet & Preferences + Payment Summary */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Diet & Preferences */}
            <div className="relative bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Diet & Preferences</h3>
                </div>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Diet Preference</label>
                      <select
                        value={editFormData.dietary_preference}
                        onChange={(e) => setEditFormData({ ...editFormData, dietary_preference: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select preference</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="non-vegetarian">Non-Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="jain">Jain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                      <textarea
                        value={editFormData.allergies}
                        onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                        placeholder="List any allergies"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                      <textarea
                        value={editFormData.medical_conditions}
                        onChange={(e) => setEditFormData({ ...editFormData, medical_conditions: e.target.value })}
                        placeholder="List any medical conditions"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  profile ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Diet Preference</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{profile.dietary_preference || '−'}</p>
                      </div>
                      {profile.allergies && (
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Allergies</p>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-gray-800">{profile.allergies}</p>
                          </div>
                        </div>
                      )}
                      {profile.medical_conditions && (
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Medical Conditions</p>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-gray-800">{profile.medical_conditions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No diet preferences recorded yet. Add details in the Progress tab.</p>
                  )
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-sm border border-emerald-100 p-6 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Summary</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    View All →
                  </button>
                </div>

                {paymentsLoading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Total Paid */}
                    <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700 mb-1">Total Paid</p>
                      <p className="text-3xl font-bold text-emerald-900">
                        ₹{payments
                          .filter(p => p.status === 'paid')
                          .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                          .toFixed(2)}
                      </p>
                    </div>

                    {/* Recent Payments */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Recent Payments</p>
                      {payments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No payments recorded yet</p>
                      ) : (
                        <div className="space-y-2">
                          {payments.slice(0, 3).map((payment) => (
                            <div key={payment.id} className="p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">₹{parseFloat(payment.amount).toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(payment.date).toLocaleDateString()} • {payment.method.replace('_', ' ')}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                  {payment.status}
                                </span>
                              </div>
                              {payment.notes && (
                                <p className="text-xs text-gray-600 mt-2 italic border-t border-gray-100 pt-2">
                                  {payment.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons - Show when editing */}
          {isEditingProfile && (
            <div className="flex gap-4 justify-end mt-6">
              <button
                onClick={handleEditProfile}
                className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={submittingProfile}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}


      {/* Diet Plans Tab */}
      {activeTab === 'diet-plans' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Diet Plans</h2>
            <button
              onClick={() => router.push(`/admin/clients/${clientId}/diet-plans?action=create`)}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              + Create Diet Plan
            </button>
          </div>

          {dietPlansLoading ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin inline-block mb-4">
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Loading diet plans...</p>
            </div>
          ) : dietPlans.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No diet plans created yet.</p>
              <p className="text-sm text-gray-500 mb-6">Create a diet plan to add meal recommendations for this client.</p>
              <button
                onClick={() => router.push(`/admin/clients/${clientId}/diet-plans?action=create`)}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                + Create First Diet Plan
              </button>
            </div>
          ) : (
            dietPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          generateDietPlanPDF(plan, dietPlanItems[plan.id] || [], client?.name || 'Client')
                        }}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                        title="Download PDF"
                      >
                        📄 PDF
                      </button>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${plan.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {plan.active ? 'Active' : 'Inactive'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedPlanId === plan.id ? 'transform rotate-180' : ''
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
                  </div>
                </div>

                {expandedPlanId === plan.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {dietPlanItems[plan.id]?.length > 0 ? (
                      <div className="space-y-3">
                        {dietPlanItems[plan.id].map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 capitalize">
                                  {item.meal_type}
                                  {item.time && <span className="ml-2 text-primary font-semibold">🕐 {item.time}</span>}
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {item.item_name}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-lg font-bold text-primary">
                                  {item.quantity} {item.unit}
                                </p>
                              </div>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                                💡 {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No items in this plan.</p>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => generateDietPlanPDF(plan, dietPlanItems[plan.id] || [], client?.name || 'Client')}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                      >
                        📄 Download PDF
                      </button>
                      <button
                        onClick={() => router.push(`/admin/clients/${clientId}/diet-plans?action=edit&plan_id=${plan.id}`)}
                        className="px-4 py-2 bg-amber-50 text-amber-600 font-semibold rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        Edit Plan
                      </button>
                      <button
                        onClick={() => handleArchivePlan(plan.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Archive Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* No Measurements Message */}
          {!client?.measurements_logs || client.measurements_logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No measurements recorded yet</p>
              <button
                onClick={() => setShowAddMeasurements(true)}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                + Add First Measurement
              </button>
              {showAddMeasurements && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Record Body Measurements</h3>
                  <form onSubmit={handleAddMeasurements} className="space-y-4">
                    {measurementsError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{measurementsError}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                          type="date"
                          value={measurementsFormData.logged_date}
                          onChange={(e) =>
                            setMeasurementsFormData({ ...measurementsFormData, logged_date: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chest (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={measurementsFormData.chest_cm}
                          onChange={(e) =>
                            setMeasurementsFormData({ ...measurementsFormData, chest_cm: e.target.value })
                          }
                          placeholder="e.g., 95.5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Waist (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={measurementsFormData.waist_cm}
                          onChange={(e) =>
                            setMeasurementsFormData({ ...measurementsFormData, waist_cm: e.target.value })
                          }
                          placeholder="e.g., 80"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hip (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={measurementsFormData.hip_cm}
                          onChange={(e) =>
                            setMeasurementsFormData({ ...measurementsFormData, hip_cm: e.target.value })
                          }
                          placeholder="e.g., 100"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thigh (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={measurementsFormData.thigh_cm}
                          onChange={(e) =>
                            setMeasurementsFormData({ ...measurementsFormData, thigh_cm: e.target.value })
                          }
                          placeholder="e.g., 55"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                        <input
                          type="text"
                          value={measurementsFormData.notes}
                          onChange={(e) =>
                            setMeasurementsFormData({ ...measurementsFormData, notes: e.target.value })
                          }
                          placeholder="Optional notes"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingMeasurements}
                      className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingMeasurements ? 'Saving...' : 'Save Measurements'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 1. TOTAL PROGRESS - Hero Stat */}
              {client?.measurements_logs && client.measurements_logs.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary p-8 text-center">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Total Progress</p>
                    <p className="text-5xl font-bold text-gray-900 mb-1">
                      {(() => {
                        const firstLog = client.measurements_logs[0]
                        const latestLog = client.measurements_logs[client.measurements_logs.length - 1]

                        const initialTotal = (firstLog.chest_cm || 0) + (firstLog.waist_cm || 0) + (firstLog.hip_cm || 0) + (firstLog.thigh_cm || 0)
                        const latestTotal = (latestLog.chest_cm || 0) + (latestLog.waist_cm || 0) + (latestLog.hip_cm || 0) + (latestLog.thigh_cm || 0)

                        const totalReduction = initialTotal - latestTotal
                        return totalReduction > 0 ? `${totalReduction.toFixed(1)} cm` : '−'
                      })()}
                    </p>
                    <p className="text-lg text-primary font-semibold">cm Lost</p>
                  </div>

                  {/* Add Measurements Button */}
                  <button
                    onClick={() => setShowAddMeasurements(!showAddMeasurements)}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    + Add Measurements
                  </button>

                  {/* Add Measurements Form - Appears right after button */}
                  {showAddMeasurements && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Record Body Measurements</h3>
                      <form onSubmit={handleAddMeasurements} className="space-y-4">
                        {measurementsError && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{measurementsError}</p>
                          </div>
                        )}

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date
                            </label>
                            <input
                              type="date"
                              value={measurementsFormData.logged_date}
                              onChange={(e) =>
                                setMeasurementsFormData({ ...measurementsFormData, logged_date: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chest (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={measurementsFormData.chest_cm}
                              onChange={(e) =>
                                setMeasurementsFormData({ ...measurementsFormData, chest_cm: e.target.value })
                              }
                              placeholder="e.g., 95.5"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Waist (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={measurementsFormData.waist_cm}
                              onChange={(e) =>
                                setMeasurementsFormData({ ...measurementsFormData, waist_cm: e.target.value })
                              }
                              placeholder="e.g., 80"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hip (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={measurementsFormData.hip_cm}
                              onChange={(e) =>
                                setMeasurementsFormData({ ...measurementsFormData, hip_cm: e.target.value })
                              }
                              placeholder="e.g., 100"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Thigh (cm)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={measurementsFormData.thigh_cm}
                              onChange={(e) =>
                                setMeasurementsFormData({ ...measurementsFormData, thigh_cm: e.target.value })
                              }
                              placeholder="e.g., 55"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notes
                            </label>
                            <input
                              type="text"
                              value={measurementsFormData.notes}
                              onChange={(e) =>
                                setMeasurementsFormData({ ...measurementsFormData, notes: e.target.value })
                              }
                              placeholder="Optional notes"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingMeasurements}
                          className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingMeasurements ? 'Saving...' : 'Save Measurements'}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}

              {/* 2. MEASUREMENT STATS CARDS - Chest, Waist, Hip, Thigh */}
              {client?.measurements_logs && client.measurements_logs.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { label: 'Chest', key: 'chest_cm', icon: '💪' },
                    { label: 'Waist', key: 'waist_cm', icon: '📏' },
                    { label: 'Hip', key: 'hip_cm', icon: '🍑' },
                    { label: 'Thigh', key: 'thigh_cm', icon: '🦵' },
                  ].map(({ label, key, icon }) => {
                    const firstLog = client.measurements_logs?.[0]
                    const latestLog = client.measurements_logs?.[client.measurements_logs.length - 1]
                    const initialValue = (firstLog ? (firstLog[key as keyof typeof firstLog] as number | null) : 0) || 0
                    const latestValue = (latestLog ? (latestLog[key as keyof typeof latestLog] as number | null) : 0) || 0
                    const reduction = (initialValue as number) && (latestValue as number) ? (initialValue as number) - (latestValue as number) : 0

                    return (
                      <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                        <p className="text-xs font-semibold text-gray-700 mb-2">{icon} {label}</p>

                        {/* Before & After Display */}
                        <div className="space-y-1.5">
                          {/* Before */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Before</p>
                            <p className="text-base font-bold text-gray-400">
                              {initialValue ? `${initialValue} cm` : '−'}
                            </p>
                          </div>

                          {/* Arrow & Reduction */}
                          <div className="flex items-center justify-center py-0.5">
                            <div className="text-center">
                              <svg className="w-2.5 h-2.5 text-green-600 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <p className="text-xs font-bold text-green-600">
                                {reduction > 0 ? `−${reduction.toFixed(1)}` : '−'} cm
                              </p>
                            </div>
                          </div>

                          {/* After */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">After</p>
                            <p className="text-base font-bold text-primary">
                              {latestValue ? `${latestValue} cm` : '−'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 3. MEASUREMENT TRENDS CHART */}
              {client?.measurements_logs && client.measurements_logs.length > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Measurement Trends</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    {(() => {
                      const chartData = (client.measurements_logs || []).map(log => ({
                        date: new Date(log.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        chest: log.chest_cm,
                        waist: log.waist_cm,
                        hip: log.hip_cm,
                        thigh: log.thigh_cm,
                        fullDate: log.logged_date,
                      }))
                      const dataKey = JSON.stringify(chartData.slice(-1))

                      return (
                        <LineChart
                          key={`chart-${dataKey}`}
                          data={chartData}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload, label }: any) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-2 border border-gray-300 rounded shadow">
                                    <p className="font-semibold text-gray-900">{label}</p>
                                    {payload.map((entry: any, index: number) => (
                                      <p key={index} style={{ color: entry.color }} className="text-sm">
                                        {entry.name}: <span className="font-bold">{entry.value} cm</span>
                                      </p>
                                    ))}
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Line type="monotone" dataKey="chest" stroke="#3b82f6" name="Chest" strokeWidth={2} dot={{ r: 4 }} connectNulls={true} />
                          <Line type="monotone" dataKey="waist" stroke="#ef4444" name="Waist" strokeWidth={2} dot={{ r: 4 }} connectNulls={true} />
                          <Line type="monotone" dataKey="hip" stroke="#ec4899" name="Hip" strokeWidth={2} dot={{ r: 4 }} connectNulls={true} />
                          <Line type="monotone" dataKey="thigh" stroke="#f59e0b" name="Thigh" strokeWidth={2} dot={{ r: 4 }} connectNulls={true} />
                        </LineChart>
                      )
                    })()}
                  </ResponsiveContainer>
                </div>
              )}

              {/* 4. MEASUREMENTS HISTORY TABLE */}
              {client?.measurements_logs && client.measurements_logs.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Measurements History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Chest (cm)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Waist (cm)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hip (cm)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thigh (cm)</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {client.measurements_logs && [...client.measurements_logs].reverse().map((log) => (
                          <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(log.logged_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {log.chest_cm ? `${log.chest_cm} cm` : '−'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {log.waist_cm ? `${log.waist_cm} cm` : '−'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {log.hip_cm ? `${log.hip_cm} cm` : '−'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {log.thigh_cm ? `${log.thigh_cm} cm` : '−'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {log.notes || '−'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. WEIGHT TRACKING */}
              {client?.weight_logs && client.weight_logs.length > 0 && (
                <>
                  <div className="border-t-2 border-gray-200 pt-8 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Weight Tracking</h2>
                  </div>

                  {/* Add Weight Button */}
                  <button
                    onClick={() => setShowAddWeight(!showAddWeight)}
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors mb-6"
                  >
                    + Add Weight
                  </button>

                  {/* Weight Stats Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <p className="text-sm text-gray-600 mb-2">Start Weight</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {profile?.weight_kg ? `${profile.weight_kg} kg` : '−'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <p className="text-sm text-gray-600 mb-2">Current Weight</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {client?.weight_logs && client.weight_logs.length > 0
                          ? `${client.weight_logs[client.weight_logs.length - 1].weight_kg} kg`
                          : profile?.weight_kg
                            ? `${profile.weight_kg} kg`
                            : '−'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <p className="text-sm text-gray-600 mb-2">Goal Weight</p>
                      <p className="text-3xl font-bold text-primary">
                        {profile?.target_weight_kg ? `${profile.target_weight_kg} kg` : '−'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <p className="text-sm text-gray-600 mb-2">Total Loss/Gain</p>
                      <p className={`text-3xl font-bold ${(() => {
                        const startWeight = profile?.weight_kg || 0
                        const currentWeight = client?.weight_logs && client.weight_logs.length > 0
                          ? client.weight_logs[client.weight_logs.length - 1].weight_kg
                          : startWeight
                        return (startWeight - currentWeight) > 0 ? 'text-green-600' : 'text-red-600'
                      })()
                        }`}>
                        {(() => {
                          const startWeight = profile?.weight_kg || 0
                          const currentWeight = client?.weight_logs && client.weight_logs.length > 0
                            ? client.weight_logs[client.weight_logs.length - 1].weight_kg
                            : startWeight
                          const difference = Math.abs(startWeight - currentWeight)
                          return difference > 0 ? `${difference.toFixed(1)} kg` : '−'
                        })()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <p className="text-sm text-gray-600 mb-2">% to Goal</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {(() => {
                          const startWeight = profile?.weight_kg
                          const targetWeight = profile?.target_weight_kg
                          const currentWeight = client?.weight_logs && client.weight_logs.length > 0
                            ? client.weight_logs[client.weight_logs.length - 1].weight_kg
                            : startWeight

                          if (!startWeight || !targetWeight || !currentWeight) return '−'

                          const totalToLose = startWeight - targetWeight
                          const alreadyLost = startWeight - currentWeight
                          const percentage = Math.round((alreadyLost / totalToLose) * 100)

                          return `${percentage}%`
                        })()}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* 7. ADD WEIGHT FORM - Conditional */}
              {showAddWeight && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Record Weight</h3>
                  <form onSubmit={handleAddWeight} className="space-y-4">
                    {weightError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{weightError}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={weightFormData.logged_date}
                          onChange={(e) =>
                            setWeightFormData({ ...weightFormData, logged_date: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={weightFormData.weight_kg}
                          onChange={(e) =>
                            setWeightFormData({ ...weightFormData, weight_kg: e.target.value })
                          }
                          placeholder="e.g., 72.5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingWeight}
                      className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingWeight ? 'Saving...' : 'Save Weight'}
                    </button>
                  </form>
                </div>
              )}

              {/* 8. WEIGHT PROGRESS CHART */}
              {client?.weight_logs && client.weight_logs.length > 0 && (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Weight Progress Chart</h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={client.weight_logs.map(log => ({
                        date: new Date(log.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        weight: log.weight_kg,
                        fullDate: log.logged_date,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => `${value} kg`}
                          labelFormatter={(label) => `Weight`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#4a7c59"
                          dot={{ fill: '#4a7c59', r: 5 }}
                          strokeWidth={2}
                          name="Weight (kg)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 9. WEIGHT HISTORY TABLE */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900">Weight History</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Weight (kg)</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Change</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {client.weight_logs && [...client.weight_logs].reverse().map((log, index) => {
                            const previousWeight = index < (client.weight_logs?.length || 0) - 1
                              ? [...(client.weight_logs || [])].reverse()[index + 1].weight_kg
                              : null
                            const change = previousWeight ? (previousWeight - log.weight_kg).toFixed(1) : '-'

                            return (
                              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {new Date(log.logged_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                  {log.weight_kg} kg
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  {change !== '-' ? (
                                    <span className={parseFloat(change) > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                      {parseFloat(change) > 0 ? '−' : '+'}{Math.abs(parseFloat(change))} kg
                                    </span>
                                  ) : (
                                    '−'
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {log.created_at ? '−' : '−'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Note</h3>
            <form onSubmit={handleAddNote} className="space-y-4">
              {notesError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{notesError}</p>
                </div>
              )}
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={submittingNote || !newNoteContent.trim()}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingNote ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          </div>

          {/* Notes List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">All Notes</h3>

            {notesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No notes yet. Add your first note above!</p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => {
                  const typeLabels: { [key: string]: { label: string; color: string } } = {
                    general: { label: 'General Note', color: 'bg-blue-100 text-blue-800' },
                    profile: { label: 'Profile Note', color: 'bg-purple-100 text-purple-800' },
                    weight: { label: 'Weight Log', color: 'bg-green-100 text-green-800' },
                    measurement: { label: 'Measurement Log', color: 'bg-orange-100 text-orange-800' },
                    lead: { label: 'Lead Note', color: 'bg-gray-100 text-gray-800' },
                  }
                  const typeInfo = typeLabels[note.type] || { label: note.type, color: 'bg-gray-100 text-gray-800' }

                  return (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {note.created_at && (
                          <span className="text-sm text-gray-500">
                            {new Date(note.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      {note.metadata && Object.keys(note.metadata).length > 0 && (
                        <div className="flex gap-4 text-sm text-gray-600 mb-2">
                          {note.metadata.logged_date && (
                            <span>📅 {new Date(note.metadata.logged_date).toLocaleDateString()}</span>
                          )}
                          {note.metadata.weight_kg && (
                            <span>⚖️ {note.metadata.weight_kg} kg</span>
                          )}
                        </div>
                      )}

                      <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Add/Edit Payment Form */}
          {showPaymentForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingPaymentId ? 'Edit Payment' : 'Add New Payment'}
              </h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {paymentsError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{paymentsError}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={paymentForm.status}
                      onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingPayment ? 'Saving...' : editingPaymentId ? 'Update Payment' : 'Add Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false)
                      setEditingPaymentId(null)
                      setPaymentForm({
                        amount: '',
                        date: new Date().toISOString().split('T')[0],
                        method: 'cash',
                        status: 'paid',
                        notes: '',
                      })
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Payment Button */}
          {!showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              + Add Payment
            </button>
          )}

          {/* Payments List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment History</h3>

            {paymentsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No payments recorded yet. Add the first payment above!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{parseFloat(payment.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {payment.method.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {payment.notes || '—'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-primary hover:text-primary-dark mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {dietLogsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : dietLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No diet logs submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-gray-900">{dietLogs.length}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dietLogs.filter(log => {
                      const logDate = new Date(log.logged_date + 'T00:00:00')
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return logDate >= weekAgo
                    }).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Average Adherence</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dietLogs.length > 0
                      ? Math.round(
                        dietLogs.reduce((sum, log) => sum + (log.adherence_percentage || 0), 0) / dietLogs.length
                      )
                      : 0
                    }%
                  </p>
                </div>
              </div>

              {/* Diet Logs List */}
              {dietLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    className="w-full text-left flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {new Date(log.logged_date + 'T00:00:00').toLocaleDateString('en-IN', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(() => {
                              const total = log.diet_log_items?.length || 0
                              const completed = log.diet_log_items?.filter((item: any) => item.completed).length || 0
                              return `${completed} of ${total} items completed`
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {(() => {
                          const total = log.diet_log_items?.length || 0
                          const completed = log.diet_log_items?.filter((item: any) => item.completed).length || 0
                          const adherence = total > 0 ? Math.round((completed / total) * 100) : 0
                          return (
                            <>
                              <p className="text-2xl font-bold text-primary">{adherence}%</p>
                              <p className="text-xs text-gray-500">Adherence</p>
                            </>
                          )
                        })()}
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedLogId === log.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {log.diet_log_items && log.diet_log_items.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-sm">Logged Items:</h4>
                          {log.diet_log_items.map((entry: any, idx: number) => (
                            <div key={idx} className="flex items-start justify-between text-sm bg-gray-50 p-3 rounded border-l-4 border-l-gray-300">
                              <div className="flex-1">
                                <span className={`font-medium ${entry.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {entry.diet_plan_items?.item_name || 'Item'}
                                </span>
                                {entry.diet_plan_items?.quantity && (
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {entry.diet_plan_items.quantity} {entry.diet_plan_items.unit}
                                  </p>
                                )}
                                {entry.comment && <p className="text-xs text-gray-500 mt-1 italic">{entry.comment}</p>}
                              </div>
                              <div className={`ml-3 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${entry.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                                {entry.completed ? '✓' : '○'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No logged items</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
