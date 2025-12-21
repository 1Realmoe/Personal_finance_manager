import { db } from '@/db'
import { accounts, holdings, investmentTransactions, accountCurrencies } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getCurrentUserId } from '@/lib/auth-helpers'
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency'
import { convertAndSum } from '@/lib/exchange'
import { getUserBaseCurrency } from '@/lib/actions/user'

export async function getInvestmentAccounts() {
	const clerkUserId = await getCurrentUserId()
	
	const accountResults = await db
		.select()
		.from(accounts)
		.where(
			and(
				eq(accounts.clerkUserId, clerkUserId),
				eq(accounts.type, 'INVESTMENT')
			)
		)

	// Fetch additional currencies for each account
	const accountsWithCurrencies = await Promise.all(
		accountResults.map(async (account) => {
			const additionalCurrencies = await db
				.select()
				.from(accountCurrencies)
				.where(
					and(
						eq(accountCurrencies.accountId, account.id),
						eq(accountCurrencies.clerkUserId, clerkUserId)
					)
				)

			return {
				...account,
				additionalCurrencies: additionalCurrencies.map((ac) => ({
					currency: ac.currency,
					balance: ac.balance,
				})),
			}
		})
	)

	return accountsWithCurrencies
}

export async function getHoldings(accountId?: string) {
	const clerkUserId = await getCurrentUserId()
	
	const conditions = [eq(holdings.clerkUserId, clerkUserId)]
	if (accountId) {
		conditions.push(eq(holdings.accountId, accountId))
	}

	const results = await db
		.select()
		.from(holdings)
		.where(and(...conditions))
		.orderBy(desc(holdings.updatedAt))

	return results
}

export async function getInvestmentTransactions(accountId?: string) {
	const clerkUserId = await getCurrentUserId()
	
	const conditions = [eq(investmentTransactions.clerkUserId, clerkUserId)]
	if (accountId) {
		conditions.push(eq(investmentTransactions.accountId, accountId))
	}

	const results = await db
		.select()
		.from(investmentTransactions)
		.where(and(...conditions))
		.orderBy(desc(investmentTransactions.date))

	return results
}

export async function getPortfolioValue(accountId?: string) {
	const holdings = accountId ? await getHoldings(accountId) : await getHoldings()
	const baseCurrency = await getUserBaseCurrency()

	if (holdings.length === 0) {
		return 0
	}

	// Calculate current value for each holding (quantity * currentPrice)
	const amountsByCurrency: Array<{ currency: CurrencyCode; amount: number }> = []

	for (const holding of holdings) {
		const quantity = parseFloat(holding.quantity || '0')
		const currentPrice = parseFloat(holding.currentPrice || '0')
		const currentValue = quantity * currentPrice
		const currency = (holding.currency || DEFAULT_CURRENCY) as CurrencyCode

		amountsByCurrency.push({
			currency,
			amount: currentValue,
		})
	}

	// Group by currency and convert to base currency
	const currencyMap = new Map<CurrencyCode, number>()
	for (const { currency, amount } of amountsByCurrency) {
		const current = currencyMap.get(currency) || 0
		currencyMap.set(currency, current + amount)
	}

	const groupedAmounts = Array.from(currencyMap.entries()).map(([currency, amount]) => ({
		currency,
		amount,
	}))

	return await convertAndSum(groupedAmounts, baseCurrency)
}

export async function getPortfolioPerformance() {
	const allHoldings = await getHoldings()
	const baseCurrency = await getUserBaseCurrency()

	let totalCost = 0
	let totalValue = 0

	const costAmounts: Array<{ currency: CurrencyCode; amount: number }> = []
	const valueAmounts: Array<{ currency: CurrencyCode; amount: number }> = []

	for (const holding of allHoldings) {
		const quantity = parseFloat(holding.quantity || '0')
		const avgPrice = parseFloat(holding.averagePurchasePrice || '0')
		const currentPrice = parseFloat(holding.currentPrice || '0')
		const currency = (holding.currency || DEFAULT_CURRENCY) as CurrencyCode

		const cost = quantity * avgPrice
		const value = quantity * currentPrice

		costAmounts.push({ currency, amount: cost })
		valueAmounts.push({ currency, amount: value })
	}

	// Group and convert
	const costCurrencyMap = new Map<CurrencyCode, number>()
	for (const { currency, amount } of costAmounts) {
		const current = costCurrencyMap.get(currency) || 0
		costCurrencyMap.set(currency, current + amount)
	}

	const valueCurrencyMap = new Map<CurrencyCode, number>()
	for (const { currency, amount } of valueAmounts) {
		const current = valueCurrencyMap.get(currency) || 0
		valueCurrencyMap.set(currency, current + amount)
	}

	const groupedCosts = Array.from(costCurrencyMap.entries()).map(([currency, amount]) => ({
		currency,
		amount,
	}))

	const groupedValues = Array.from(valueCurrencyMap.entries()).map(([currency, amount]) => ({
		currency,
		amount,
	}))

	totalCost = await convertAndSum(groupedCosts, baseCurrency)
	totalValue = await convertAndSum(groupedValues, baseCurrency)

	const gainLoss = totalValue - totalCost
	const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

	return {
		totalCost,
		totalValue,
		gainLoss,
		gainLossPercent,
		baseCurrency,
	}
}

