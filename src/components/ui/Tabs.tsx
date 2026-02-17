'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  defaultTab?: string
  variant?: 'underline' | 'pills' | 'boxed'
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    { className, tabs, defaultTab, variant = 'underline', ...props },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState(
      defaultTab || tabs[0]?.id || ''
    )

    const activeTabContent = tabs.find((tab) => tab.id === activeTab)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Tab buttons */}
        <div
          className={cn(
            'flex border-b border-gray-200',
            variant === 'pills' && 'gap-2 border-b-0 p-1 bg-gray-100 rounded-lg w-fit',
            variant === 'boxed' && 'gap-2 border-b-0'
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-4 py-3 font-medium text-sm transition-smooth flex items-center gap-2',
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-900',
                variant === 'underline' && activeTab === tab.id && 'border-b-2 border-primary',
                variant === 'pills' && activeTab === tab.id && 'bg-white rounded-md shadow-sm',
                variant === 'boxed' && activeTab === tab.id && 'bg-primary text-white rounded-lg',
                variant === 'boxed' && activeTab !== tab.id && 'bg-gray-100 text-gray-700 rounded-lg'
              )}
            >
              {tab.icon && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6 animate-fadeIn">
          {activeTabContent && activeTabContent.content}
        </div>
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'

export { Tabs }
export type { Tab }
