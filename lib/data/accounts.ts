import { db } from '@/db'
import { accounts, accountCurrencies } from '@/db/schema'
import { eq, and, ne } from 'drizzle-orm'
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency'
import { convertAndSum } from '@/lib/exchange'
import { getUserBaseCurrency } from '@/lib/actions/user'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function getAccounts(excludeInvestmentAccounts: boolean = false) {
	const clerkUserId = await getCurrentUserId()
	
	const accountResults = await db
		.select()
		.from(accounts)
		.where(
			excludeInvestmentAccounts
				? and(eq(accounts.clerkUserId, clerkUserId), ne(accounts.type, 'INVESTMENT'))
				: eq(accounts.clerkUserId, clerkUserId)
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

export async function getAccountBalance(accountId: string) {
	const clerkUserId = await getCurrentUserId()
	const [account] = await db
		.select({ balance: accounts.balance })
		.from(accounts)
		.where(
			and(
				eq(accounts.id, accountId),
				eq(accounts.clerkUserId, clerkUserId)
			)
		)

	return account?.balance || '0'
}

export async function getTotalBalance() {
	const allAccounts = await getAccounts()
	const baseCurrency = await getUserBaseCurrency()

	// Collect all balances with their currencies
	const amountsByCurrency: Array<{ currency: CurrencyCode; amount: number }> = []

	for (const account of allAccounts) {
		// Add primary account balance
		const accountCurrency = (account.currency || DEFAULT_CURRENCY) as CurrencyCode
		amountsByCurrency.push({
			currency: accountCurrency,
			amount: parseFloat(account.balance || '0'),
		})

		// Add additional currency balances
		if (account.additionalCurrencies) {
			for (const ac of account.additionalCurrencies) {
				amountsByCurrency.push({
					currency: (ac.currency || DEFAULT_CURRENCY) as CurrencyCode,
					amount: parseFloat(ac.balance || '0'),
				})
			}
		}
	}

	// Group by currency and sum
	const currencyMap = new Map<CurrencyCode, number>()
	for (const { currency, amount } of amountsByCurrency) {
		const current = currencyMap.get(currency) || 0
		currencyMap.set(currency, current + amount)
	}

	// Convert to array format and convert to base currency
	const groupedAmounts = Array.from(currencyMap.entries()).map(([currency, amount]) => ({
		currency,
		amount,
	}))

	const total = await convertAndSum(groupedAmounts, baseCurrency)
	return total.toFixed(2)
}

