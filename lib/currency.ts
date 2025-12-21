export const currencies = [
	{ code: 'USD', name: 'US Dollar', symbol: '$' },
	{ code: 'EUR', name: 'Euro', symbol: '€' },
	{ code: 'GBP', name: 'Pound', symbol: '£' },
	{ code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
] as const

export type CurrencyCode = typeof currencies[number]['code']

// Currencies that use postfix symbols (symbol comes after the number)
const postfixCurrencies = ['SEK', 'NOK', 'DKK', 'PLN']

export function getCurrencySymbol(currencyCode: string): string {
	const currency = currencies.find((c) => c.code === currencyCode)
	return currency?.symbol || currencyCode
}

export function formatCurrency(
	amount: number | string,
	currencyCode: string = 'USD',
	options?: {
		minimumFractionDigits?: number
		maximumFractionDigits?: number
	}
): string {
	const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
	const symbol = getCurrencySymbol(currencyCode)
	const isPostfix = postfixCurrencies.includes(currencyCode)
	
	const formattedAmount = amountNum.toLocaleString('en-US', {
		minimumFractionDigits: options?.minimumFractionDigits ?? 2,
		maximumFractionDigits: options?.maximumFractionDigits ?? 2,
	})

	return isPostfix ? `${formattedAmount} ${symbol}` : `${symbol}${formattedAmount}`
}

export function getCurrencyByCode(code: string) {
	return currencies.find((c) => c.code === code) || currencies[0]
}

