import React from 'react'
import { cn } from '@/lib/utils'

interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  children: React.ReactNode
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  (
    { className, label, error, helpText, required, children, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {children}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helpText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helpText}</p>
        )}
      </div>
    )
  }
)

FormGroup.displayName = 'FormGroup'

export { FormGroup }
