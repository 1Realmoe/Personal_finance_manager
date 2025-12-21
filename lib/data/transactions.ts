import { db } from '@/db'
import { transactions, accounts, categories } from '@/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

const userId = 'user_1'

export async function getTransactions(limit?: number) {
	const results = await db
		.select({
			id: transactions.id,
			amount: transactions.amount,
			description: transactions.description,
			date: transactions.date,
			type: transactions.type,
			accountId: transactions.accountId,
			accountName: accounts.name,
			categoryId: transactions.categoryId,
			categoryName: categories.name,
			currency: transactions.currency,
			source: transactions.source,
			isRecurrent: transactions.isRecurrent,
			recurrenceFrequency: transactions.recurrenceFrequency,
		})
		.from(transactions)
		.leftJoin(accounts, eq(transactions.accountId, accounts.id))
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(eq(transactions.userId, userId))
		.orderBy(desc(transactions.date))
		.limit(limit || 100)

	return results
}

export async function getRecentTransactions(count: number = 5) {
	return getTransactions(count)
}

export async function getTransactionsByMonth(year: number, month: number) {
	const startDate = new Date(year, month - 1, 1)
	const endDate = new Date(year, month, 0, 23, 59, 59)

	const results = await db
		.select({
			id: transactions.id,
			amount: transactions.amount,
			description: transactions.description,
			date: transactions.date,
			type: transactions.type,
			accountId: transactions.accountId,
			accountName: accounts.name,
			categoryId: transactions.categoryId,
			categoryName: categories.name,
			currency: transactions.currency,
			source: transactions.source,
			isRecurrent: transactions.isRecurrent,
			recurrenceFrequency: transactions.recurrenceFrequency,
		})
		.from(transactions)
		.leftJoin(accounts, eq(transactions.accountId, accounts.id))
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.orderBy(desc(transactions.date))

	return results
}

