export const currencies = [
	{ code: 'USD', name: 'US Dollar', symbol: '$' },
	{ code: 'EUR', name: 'Euro', symbol: '€' },
	{ code: 'GBP', name: 'British Pound', symbol: '£' },
	{ code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
	{ code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
	{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
	{ code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
	{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
	{ code: 'INR', name: 'Indian Rupee', symbol: '₹' },
	{ code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
	{ code: 'MXN', name: 'Mexican Peso', symbol: '$' },
	{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
	{ code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
	{ code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
	{ code: 'KRW', name: 'South Korean Won', symbol: '₩' },
	{ code: 'ZAR', name: 'South African Rand', symbol: 'R' },
	{ code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
	{ code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
	{ code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
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

