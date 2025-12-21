import { db } from '@/db'
import { transactions } from '@/db/schema'
import { eq, and, gte, lte, sql, sum } from 'drizzle-orm'

const userId = 'user_1'

export async function getMonthlyIncome(year: number, month: number) {
	// month is 1-indexed (1-12), JavaScript Date uses 0-indexed months (0-11)
	// Use UTC to avoid timezone issues
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	// Get last day of the month by using day 0 of next month
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const result = await db
		.select({
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'INCOME'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)

	return parseFloat(result[0]?.total || '0')
}

export async function getMonthlyExpense(year: number, month: number) {
	// Use UTC to avoid timezone issues
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const result = await db
		.select({
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)

	return parseFloat(result[0]?.total || '0')
}

export async function getDailyExpensesForMonth(year: number, month: number) {
	// Use UTC to avoid timezone issues
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const results = await db
		.select({
			date: sql<string>`(${transactions.date})::date`,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(sql`(${transactions.date})::date`)
		.orderBy(sql`(${transactions.date})::date`)

	return results.map((r) => ({
		date: r.date,
		total: parseFloat(r.total || '0'),
	}))
}

