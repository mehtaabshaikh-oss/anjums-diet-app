'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [clientName, setClientName] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const name = localStorage.getItem('client_name')
    setClientName(name)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('client_id')
    localStorage.removeItem('client_name')
    localStorage.removeItem('client_email')
    router.push('/client/login')
  }

  const isActive = (path: string) => {
    return pathname === path
      ? 'text-primary bg-primary-light'
      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/client/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Anjum's Diet</h1>
                <p className="text-xs text-gray-500">Wellness Portal</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/client/dashboard"
                className={`text-sm font-medium transition-colors ${isActive('/client/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                href="/client/diet-plan"
                className={`text-sm font-medium transition-colors ${isActive('/client/diet-plan')}`}
              >
                Diet Plan
              </Link>
              <Link
                href="/client/history"
                className={`text-sm font-medium transition-colors ${isActive('/client/history')}`}
              >
                History
              </Link>
              <div className="flex items-center gap-3 pl-8 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {clientName || 'Client'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <Link
                href="/client/dashboard"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                href="/client/diet-plan"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg mt-1"
              >
                Diet Plan
              </Link>
              <Link
                href="/client/history"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg mt-1"
              >
                History
              </Link>
              <button
                onClick={handleLogout}
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
