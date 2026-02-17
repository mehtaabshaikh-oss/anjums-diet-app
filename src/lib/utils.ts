import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge classnames with Tailwind CSS conflict resolution
 * Uses clsx for conditional classes and twMerge to handle Tailwind overrides
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
