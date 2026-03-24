'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    commitment: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Goal: ${formData.goal} \nCommitment: ${formData.commitment} \nDetails: ${formData.message}`,
          source: 'application_form',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', goal: '', commitment: '', message: '' })
      setTimeout(() => setSuccess(false), 8000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 px-6 bg-emerald-50 rounded-3xl text-center border border-emerald-100 shadow-inner">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-500/30">✓</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">Application Received</h3>
        <p className="text-emerald-800 font-medium leading-relaxed max-w-sm mx-auto">
          Thank you for applying. If your health profile is a clinical fit, our team will reach out via WhatsApp within 24 hours to schedule your consultation.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Legal Full Name <span className="text-red-500">*</span></label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="First and Last Name" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900 font-medium" required disabled={isLoading} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@email.com" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900 font-medium" disabled={isLoading} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number <span className="text-red-500">*</span></label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX" className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900 font-medium" required disabled={isLoading} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Primary Transformation Goal <span className="text-red-500">*</span></label>
        <select name="goal" value={formData.goal} onChange={handleChange} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white text-gray-900 font-medium cursor-pointer" required disabled={isLoading}>
          <option value="" disabled>Select your main clinical focus...</option>
          <option value="Weight Loss">Sustainable Weight & Fat Loss</option>
          <option value="PCOS/Thyroid">PCOS or Thyroid Reversal</option>
          <option value="Diabetes">Diabetes Management & Reversal</option>
          <option value="Gut Health">Gut Health & Inflammatory Repair</option>
          <option value="Other">Other Specific Medical condition</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Readiness to Invest in Health? <span className="text-red-500">*</span></label>
        <select name="commitment" value={formData.commitment} onChange={handleChange} className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white text-gray-900 font-medium cursor-pointer" required disabled={isLoading}>
          <option value="" disabled>Select your status...</option>
          <option value="Ready Now">I am intensely committed and ready to start</option>
          <option value="Exploring">I need more info first but I am interested</option>
          <option value="Budgeting">I am currently saving/budgeting for a program</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Briefly describe what you've struggled with <span className="text-red-500">*</span></label>
        <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="E.g. I have tried keto, intermittent fasting... I lack energy in the mornings..." className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none text-gray-900 font-medium" required disabled={isLoading} />
      </div>

      <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group text-lg mt-2" disabled={isLoading}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? 'Submitting Application...' : 'Submit Application'}
          {!isLoading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
        </span>
      </button>
      <p className="text-xs text-center text-gray-400 mt-4 font-medium uppercase tracking-wider">🔒 Your data is fully encrypted and clinical-in-confidence.</p>
    </form>
  )
}
