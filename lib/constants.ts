/**
 * Application-wide constants
 * Centralized configuration values for maintainability
 */

// File upload limits (in bytes)
export const FILE_SIZE_LIMITS = {
	RECEIPT_IMAGE: 5 * 1024 * 1024, // 5MB (base64 increases size by ~33%)
	CARD_IMAGE: 5 * 1024 * 1024, // 5MB
	RECEIPT_SCANNER: 10 * 1024 * 1024, // 10MB (client-side processing)
} as const

// Exchange rate cache duration (in seconds)
export const EXCHANGE_RATE_CACHE_DURATION = 86400 // 24 hours

// Date validation ranges
export const DATE_VALIDATION = {
	MIN_YEARS_AGO: 5,
	MAX_YEARS_AHEAD: 1,
} as const

// Amount validation
export const AMOUNT_VALIDATION = {
	MIN_TOTAL: 1.0,
	MAX_TOTAL: 1000000,
	MIN_REASONABLE_TOTAL: 10,
	MAX_REASONABLE_TOTAL: 5000,
} as const

