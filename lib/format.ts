import { format as dateFnsFormat } from 'date-fns'
import { formatCurrency, getCurrencySymbol, currencies, getCurrencyByCode, getDefaultCurrency, DEFAULT_CURRENCY, type CurrencyCode } from './currency'

/**
 * Centralized formatting utilities for dates, currency, and numbers
 * This serves as the single source of truth for all formatting in the application
 */

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date for display in forms (full date format)
 * Example: "January 1, 2024"
 */
export function formatDateFull(date: Date | string | null | undefined): string {
	if (!date) return ''
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateFnsFormat(dateObj, 'PPP')
}

/**
 * Format a date for display in tables and lists (short format)
 * Example: "Jan 1, 2024"
 */
export function formatDateShort(date: Date | string | null | undefined): string {
	if (!date) return ''
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateFnsFormat(dateObj, 'MMM d, yyyy')
}

/**
 * Format a date for display in charts and compact views
 * Example: "Jan 1"
 */
export function formatDateCompact(date: Date | string | null | undefined): string {
	if (!date) return ''
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateFnsFormat(dateObj, 'MMM d')
}

/**
 * Format a date for month/year pickers
 * Example: "January 2024"
 */
export function formatDateMonthYear(date: Date | string | null | undefined): string {
	if (!date) return ''
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateFnsFormat(dateObj, 'MMMM yyyy')
}

/**
 * Format a date for chart axes (month abbreviation + day)
 * Example: "Jan 1"
 */
export function formatDateForChart(date: Date | string | null | undefined): string {
	if (!date) return ''
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format month name for calendar dropdowns
 * Example: "Jan"
 */
export function formatMonthShort(date: Date): string {
	return date.toLocaleString('default', { month: 'short' })
}

/**
 * Format date for calendar day attributes
 * Example: "1/1/2024"
 */
export function formatDateForAttribute(date: Date): string {
	return date.toLocaleDateString()
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

// Re-export currency functions for convenience
export { formatCurrency, getCurrencySymbol, currencies, getCurrencyByCode, getDefaultCurrency, DEFAULT_CURRENCY, type CurrencyCode }

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with locale-specific formatting (no currency symbol)
 * Example: "1,234.56"
 */
export function formatNumber(
	value: number | string | null | undefined,
	options?: {
		minimumFractionDigits?: number
		maximumFractionDigits?: number
	}
): string {
	if (value === null || value === undefined) return '0'
	const numValue = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(numValue)) return '0'
	
	return numValue.toLocaleString('en-US', {
		minimumFractionDigits: options?.minimumFractionDigits ?? 0,
		maximumFractionDigits: options?.maximumFractionDigits ?? 2,
	})
}

/**
 * Format a number for chart tooltips and displays
 * Example: "1,234"
 */
export function formatNumberForChart(value: number | string | null | undefined): string {
	return formatNumber(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

