'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

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
}

export default function ClientDietPlansPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const clientId = params.id as string
  const actionParam = searchParams.get('action')

  const [dietPlans, setDietPlans] = useState<DietPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(actionParam === 'create')
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)
  const [planItems, setPlanItems] = useState<{ [key: string]: DietPlanItem[] }>({})

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [
      { meal_type: 'breakfast', item_name: '', quantity: 0, unit: 'pieces' },
    ],
  })

  useEffect(() => {
    fetchDietPlans()
  }, [clientId])

  const fetchDietPlans = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/diet-plans?client_id=${clientId}`)
      if (!response.ok) throw new Error('Failed to fetch diet plans')
      const data = await response.json()
      setDietPlans(data)

      // Fetch items for each plan
      for (const plan of data) {
        const itemsResponse = await fetch(`/api/admin/diet-plans/${plan.id}/items`)
        if (itemsResponse.ok) {
          const items = await itemsResponse.json()
          setPlanItems(prev => ({ ...prev, [plan.id]: items }))
        }
      }
    } catch (err) {
      setError('Failed to load diet plans')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { meal_type: 'breakfast', item_name: '', quantity: 0, unit: 'pieces' },
      ],
    }))
  }

  const removeItemRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItemRow = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const isEditing = !!editingPlanId
      const url = isEditing
        ? `/api/admin/diet-plans/${editingPlanId}`
        : '/api/admin/diet-plans'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          name: formData.name,
          description: formData.description,
          items: formData.items.filter(item => item.item_name.trim()),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} diet plan`)
        return
      }

      setShowForm(false)
      setEditingPlanId(null)
      setFormData({
        name: '',
        description: '',
        items: [{ meal_type: 'breakfast', item_name: '', quantity: 0, unit: 'pieces' }],
      })
      await fetchDietPlans()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    }
  }

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlanId(plan.id)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      items: planItems[plan.id]?.map(item => ({
        meal_type: item.meal_type,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
      })) || [{ meal_type: 'breakfast', item_name: '', quantity: 0, unit: 'pieces' }],
    })
    setShowForm(true)
    setExpandedPlanId(null)
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return

    try {
      const response = await fetch(`/api/admin/diet-plans/${planId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete diet plan')
      await fetchDietPlans()
    } catch (err) {
      setError('Failed to delete diet plan')
      console.error(err)
    }
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    setEditingPlanId(null)
    setFormData({
      name: '',
      description: '',
      items: [{ meal_type: 'breakfast', item_name: '', quantity: 0, unit: 'pieces' }],
    })
  }

  const generatePDF = (plan: DietPlan) => {
    const items = planItems[plan.id] || []

    // Group items by meal type
    const mealGroups: { [key: string]: DietPlanItem[] } = {}
    items.forEach(item => {
      if (!mealGroups[item.meal_type]) {
        mealGroups[item.meal_type] = []
      }
      mealGroups[item.meal_type].push(item)
    })

    // Create HTML content
    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${plan.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #1f2937;
              border-bottom: 3px solid #10b981;
              padding-bottom: 10px;
            }
            h2 {
              color: #1f2937;
              background-color: #e5e7eb;
              padding: 10px;
              border-left: 4px solid #10b981;
              margin-top: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #10b981;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #d1d5db;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .description {
              margin: 15px 0;
              color: #6b7280;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <h1>${plan.name}</h1>
          ${plan.description ? `<div class="description">${plan.description}</div>` : ''}
    `

    // Add meal sections
    Object.keys(mealGroups).forEach(mealType => {
      html += `
        <h2>${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
      `

      mealGroups[mealType].forEach(item => {
        html += `
          <tr>
            <td>${item.item_name}</td>
            <td>${item.quantity} ${item.unit}</td>
          </tr>
        `
      })

      html += `
          </tbody>
        </table>
      `
    })

    html += `
        </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plan.name.replace(/\s+/g, '_')}_diet_plan.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          <p className="text-gray-600">Loading diet plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diet Plans</h1>
          <p className="text-gray-600 mt-1">Create and manage meal plans for this client</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          Back
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingPlanId ? 'Edit Diet Plan' : 'Create New Diet Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Breakfast Plan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., High protein, low carb breakfast plan"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Diet Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Meal Items
                </label>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Meal Type */}
                    <select
                      value={item.meal_type}
                      onChange={e => updateItemRow(index, 'meal_type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="brunch">Brunch</option>
                      <option value="lunch">Lunch</option>
                      <option value="snack">Snack</option>
                      <option value="dinner">Dinner</option>
                      <option value="supper">Supper</option>
                    </select>

                    {/* Item Name */}
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={e => updateItemRow(index, 'item_name', e.target.value)}
                      placeholder="e.g., Roti"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />

                    {/* Quantity */}
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItemRow(index, 'quantity', parseFloat(e.target.value))}
                      placeholder="Qty"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      step="0.1"
                    />

                    {/* Unit */}
                    <select
                      value={item.unit}
                      onChange={e => updateItemRow(index, 'unit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="gm">Grams</option>
                      <option value="ml">ML</option>
                      <option value="cup">Cup</option>
                      <option value="tbsp">Tbsp</option>
                      <option value="tsp">Tsp</option>
                    </select>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                {editingPlanId ? 'Update Diet Plan' : 'Create Diet Plan'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Diet Plans List */}
      {!showForm && (
        <div className="space-y-4">
          {dietPlans.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No diet plans created yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                + Create First Diet Plan
              </button>
            </div>
          ) : (
            dietPlans.map(plan => (
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
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      {plan.description && (
                        <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        plan.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.active ? 'Active' : 'Inactive'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedPlanId === plan.id ? 'transform rotate-180' : ''
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

                {/* Expanded Items */}
                {expandedPlanId === plan.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {planItems[plan.id]?.length > 0 ? (
                      <div className="space-y-3">
                        {planItems[plan.id].map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-600 capitalize">
                                {item.meal_type}
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {item.item_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {item.quantity} {item.unit}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No items in this plan.</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => generatePDF(plan)}
                        className="px-4 py-2 bg-green-50 text-green-600 font-semibold rounded-lg hover:bg-green-100 transition-colors"
                      >
                        📄 Download PDF
                      </button>
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit Plan
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
