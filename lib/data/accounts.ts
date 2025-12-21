import { db } from '@/db'
import { accounts, accountCurrencies } from '@/db/schema'
import { eq } from 'drizzle-orm'

const userId = 'user_1'

export async function getAccounts() {
	const accountResults = await db
		.select()
		.from(accounts)
		.where(eq(accounts.userId, userId))

	// Fetch additional currencies for each account
	const accountsWithCurrencies = await Promise.all(
		accountResults.map(async (account) => {
			const additionalCurrencies = await db
				.select()
				.from(accountCurrencies)
				.where(eq(accountCurrencies.accountId, account.id))

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
	const [account] = await db
		.select({ balance: accounts.balance })
		.from(accounts)
		.where(eq(accounts.id, accountId))

	return account?.balance || '0'
}

export async function getTotalBalance() {
	const allAccounts = await getAccounts()
	const total = allAccounts.reduce((sum, account) => {
		return sum + parseFloat(account.balance || '0')
	}, 0)

	return total.toFixed(2)
}

