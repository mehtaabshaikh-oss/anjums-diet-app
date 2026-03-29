'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function NewClientPageContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lead_id: null as string | null,
    package: 'gold',
    duration_months: '3',
    nutritionist: 'anjum',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    gender: '',
    age: '',
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

  // Pre-fill form from lead data if coming from leads page
  useEffect(() => {
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const leadId = searchParams.get('lead_id')

    if (name || email || phone || leadId) {
      setFormData((prev) => ({
        ...prev,
        name: name || '',
        email: email || '',
        phone: phone || '',
        lead_id: leadId || null,
      }))
    }
  }, [searchParams])

  const [generatedPassword, setGeneratedPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const generatePassword = () => {
    // Generate password from last 4 digits of phone + last name
    const phone = formData.phone.slice(-4)
    const nameParts = formData.name.split(' ')
    const lastName = nameParts[nameParts.length - 1] || formData.name
    const password = `${lastName}@${phone}`
    setGeneratedPassword(password)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const isFormValid = () => {
    // Check all required fields
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.package !== '' &&
      formData.nutritionist !== '' &&
      formData.duration_months !== '' &&
      formData.start_date.trim() !== '' &&
      formData.end_date.trim() !== '' &&
      generatedPassword !== ''
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!generatedPassword) {
        setError('Please generate a password for the client')
        setIsLoading(false)
        return
      }

      // Import bcryptjs (we'll do a simple server-side hash)
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          password: generatedPassword,
          duration_months: formData.duration_months ? parseInt(formData.duration_months) : null,
          age: formData.age ? parseInt(formData.age) : null,
          height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          target_weight_kg: formData.target_weight_kg
            ? parseFloat(formData.target_weight_kg)
            : null,
          chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
          waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
          hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
          thigh_cm: formData.thigh_cm ? parseFloat(formData.thigh_cm) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create client')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/admin/clients/${data.id}`)
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Client</h1>
        <p className="text-gray-600">Fill in the details below to register a new client</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">✓ Client created successfully! Redirecting...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Ritika Sarin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., ritika@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g., +91 9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Package & Dates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Package & Duration</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Type *
              </label>
              <select
                name="package"
                value={formData.package}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="gold">Gold</option>
                <option value="hybrid">Hybrid</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            {/* Nutritionist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Nutritionist *
              </label>
              <select
                name="nutritionist"
                value={formData.nutritionist}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="anjum">Anjum</option>
                <option value="nutritionist_1">Nutritionist 1</option>
                <option value="nutritionist_2">Nutritionist 2</option>
                <option value="nutritionist_3">Nutritionist 3</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration *
              </label>
              <select
                name="duration_months"
                value={formData.duration_months}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="9">9 Months</option>
                <option value="12">12 Months (1 Year)</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Manually enter the client's plan end date
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Health Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Health Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="e.g., 28"
                min="18"
                max="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleInputChange}
                placeholder="e.g., 165"
                min="100"
                max="250"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Current Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              <input
                type="number"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleInputChange}
                placeholder="e.g., 75"
                min="30"
                max="300"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Target Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Weight (kg)
              </label>
              <input
                type="number"
                name="target_weight_kg"
                value={formData.target_weight_kg}
                onChange={handleInputChange}
                placeholder="e.g., 65"
                min="30"
                max="300"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Diet Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preference
              </label>
              <select
                name="dietary_preference"
                value={formData.dietary_preference}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select preference</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
              </select>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
            <h3 className="col-span-full text-lg font-semibold text-gray-900">Body Measurements (Optional)</h3>

            {/* Chest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chest (cm)
              </label>
              <input
                type="number"
                name="chest_cm"
                value={formData.chest_cm}
                onChange={handleInputChange}
                placeholder="e.g., 90"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Waist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waist (cm)
              </label>
              <input
                type="number"
                name="waist_cm"
                value={formData.waist_cm}
                onChange={handleInputChange}
                placeholder="e.g., 75"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Hip */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hip (cm)
              </label>
              <input
                type="number"
                name="hip_cm"
                value={formData.hip_cm}
                onChange={handleInputChange}
                placeholder="e.g., 95"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Thigh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thigh (cm)
              </label>
              <input
                type="number"
                name="thigh_cm"
                value={formData.thigh_cm}
                onChange={handleInputChange}
                placeholder="e.g., 52"
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Allergies & Medical Conditions */}
          <div className="grid grid-cols-1 gap-6 mt-6">
            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="e.g., Peanuts, shellfish"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Medical Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Conditions
              </label>
              <textarea
                name="medical_conditions"
                value={formData.medical_conditions}
                onChange={handleInputChange}
                placeholder="e.g., Diabetes, PCOD"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Password */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Client Password</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate a temporary password for the client. They will be asked to change it on first login.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => generatePassword()}
                disabled={!formData.name || !formData.phone}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                🔐 Generate Password
              </button>
            </div>

            {generatedPassword && (
              <div className={`p-4 rounded-lg border-2 bg-green-50 border-green-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-semibold mb-2 text-green-600`}>
                      ✓ Generated Password:
                    </p>
                    <p className="font-mono text-lg font-bold break-all">
                      {generatedPassword}
                    </p>
                    <p className="text-xs text-green-700 mt-2">
                      Format: {formData.name.split(' ')[formData.name.split(' ').length - 1] || 'LastName'}@{formData.phone.slice(-4)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap ml-4"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Client...' : 'Create Client'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewClientPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewClientPageContent />
    </Suspense>
  )
}
