import React from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
  gradient?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'accent'
}

const colorGradients = {
  primary: 'from-primary to-primary-dark',
  success: 'from-green-500 to-green-600',
  warning: 'from-amber-500 to-amber-600',
  danger: 'from-red-500 to-red-600',
  accent: 'from-accent to-accent-dark',
}

const colorBgs = {
  primary: 'bg-gradient-to-br from-primary/10 to-primary-dark/10',
  success: 'bg-gradient-to-br from-green-50 to-green-100',
  warning: 'bg-gradient-to-br from-amber-50 to-amber-100',
  danger: 'bg-gradient-to-br from-red-50 to-red-100',
  accent: 'bg-gradient-to-br from-accent/10 to-accent-dark/10',
}

const labelColors = {
  primary: 'text-primary-dark',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
  accent: 'text-amber-800',
}

const valueColors = {
  primary: 'text-primary-dark',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  accent: 'text-accent-dark',
}

const iconBgs = {
  primary: 'bg-primary/20',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  danger: 'bg-red-100',
  accent: 'bg-accent/20',
}

const iconColors = {
  primary: 'text-primary-dark',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  accent: 'text-accent-dark',
}

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600',
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      unit,
      trend,
      trendValue,
      icon,
      gradient = true,
      color = 'primary',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border-2 p-6 shadow-md transition-smooth card-hover',
          gradient ? colorBgs[color] : 'border-gray-200 bg-white',
          gradient && color === 'primary' && 'border-primary/30',
          gradient && color === 'success' && 'border-green-200',
          gradient && color === 'warning' && 'border-amber-200',
          gradient && color === 'danger' && 'border-red-200',
          gradient && color === 'accent' && 'border-accent/30',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn('text-sm font-semibold uppercase tracking-wider', gradient && labelColors[color], !gradient && 'text-gray-600')}>
              {label}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={cn('text-3xl font-bold', gradient && valueColors[color], !gradient && 'text-gray-900')}>
                {value}
              </span>
              {unit && (
                <span className={cn('text-sm font-medium', gradient && labelColors[color], !gradient && 'text-gray-600')}>
                  {unit}
                </span>
              )}
            </div>
            {trend && trendValue && (
              <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trendColors[trend])}>
                <span>{trendIcons[trend]}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn('rounded-lg p-3', gradient && iconBgs[color], !gradient && 'bg-gray-100')}>
              <div className={cn(gradient && iconColors[color], !gradient && 'text-gray-600')}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard }
