import { CurrencyCode, DEFAULT_CURRENCY } from './currency'

interface ExchangeRateResponse {
	rates: Record<string, number>
	base: string
	date: string
}

/**
 * Get exchange rate from frankfurter.app API
 * Uses Next.js caching with 24h revalidation
 */
async function fetchExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
	// If same currency, return 1.0
	if (from === to) {
		return 1.0
	}

	const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`

	try {
		const response = await fetch(url, {
			next: { revalidate: 86400 }, // Cache for 24 hours
		})

		if (!response.ok) {
			throw new Error(`Exchange rate API error: ${response.statusText}`)
		}

		const data: ExchangeRateResponse = await response.json()
		const rate = data.rates[to]

		if (typeof rate !== 'number' || isNaN(rate)) {
			throw new Error(`Invalid exchange rate received for ${from} to ${to}`)
		}

		return rate
	} catch (error) {
		console.error(`Failed to fetch exchange rate from ${from} to ${to}:`, error)
		// Fallback: if same currency family or API fails, return 1.0
		// In production, you might want to use a fallback rate or throw
		if (from === to) {
			return 1.0
		}
		// For now, throw error to make failures visible
		throw new Error(`Exchange rate fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

/**
 * Get exchange rate between two currencies
 * Caches results using Next.js fetch caching
 */
export async function getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
	return fetchExchangeRate(from, to)
}

/**
 * Convert an amount from one currency to another
 */
export async function convertAmount(
	amount: number,
	from: CurrencyCode,
	to: CurrencyCode
): Promise<number> {
	if (from === to) {
		return amount
	}

	const rate = await getExchangeRate(from, to)
	return amount * rate
}

/**
 * Convert multiple amounts grouped by currency to a base currency
 * Returns the sum of all converted amounts
 */
export async function convertAndSum(
	amountsByCurrency: Array<{ currency: CurrencyCode; amount: number }>,
	toCurrency: CurrencyCode
): Promise<number> {
	if (amountsByCurrency.length === 0) {
		return 0
	}

	const conversions = await Promise.all(
		amountsByCurrency.map(async ({ currency, amount }) => {
			return convertAmount(amount, currency, toCurrency)
		})
	)

	return conversions.reduce((sum, converted) => sum + converted, 0)
}

