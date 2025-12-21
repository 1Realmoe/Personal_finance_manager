import { db } from '@/db'
import { DEFAULT_CURRENCY } from '@/lib/currency'
import { transactions, categories, accounts, goals } from '@/db/schema'
import { eq, and, gte, lte, sql, sum, count, desc } from 'drizzle-orm'

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

export async function getFrequentExpenses(year: number, month: number) {
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const results = await db
		.select({
			description: transactions.description,
			amount: transactions.amount,
			categoryName: categories.name,
			currency: transactions.currency,
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, true),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.orderBy(desc(transactions.date))
		.limit(5)

	return results.map((r) => ({
		description: r.description,
		amount: parseFloat(r.amount || '0'),
		categoryName: r.categoryName,
		currency: r.currency || DEFAULT_CURRENCY,
	}))
}

export async function getSingleExpenses(year: number, month: number) {
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const results = await db
		.select({
			description: transactions.description,
			amount: transactions.amount,
			categoryName: categories.name,
			currency: transactions.currency,
			date: transactions.date,
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, false),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.orderBy(desc(transactions.amount))
		.limit(5)

	return results.map((r) => ({
		description: r.description,
		amount: parseFloat(r.amount || '0'),
		categoryName: r.categoryName,
		currency: r.currency || DEFAULT_CURRENCY,
		date: r.date,
	}))
}

export async function getTopExpensesByCategory(year: number, month: number) {
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const results = await db
		.select({
			categoryName: categories.name,
			total: sum(transactions.amount),
			currency: sql<string>`MAX(${transactions.currency})`.as('currency'),
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(categories.name)
		.orderBy(desc(sum(transactions.amount)))
		.limit(5)

	return results.map((r) => ({
		categoryName: r.categoryName || 'Uncategorized',
		total: parseFloat(r.total || '0'),
		currency: r.currency || DEFAULT_CURRENCY,
	}))
}

export async function getOverviewStats() {
	const [accountsCount, categoriesCount, goalsCount, transactionsCount] = await Promise.all([
		db.select({ count: count() }).from(accounts).where(eq(accounts.userId, userId)),
		db.select({ count: count() }).from(categories).where(eq(categories.userId, userId)),
		db.select({ count: count() }).from(goals).where(eq(goals.userId, userId)),
		db.select({ count: count() }).from(transactions).where(eq(transactions.userId, userId)),
	])

	return {
		accounts: accountsCount[0]?.count || 0,
		categories: categoriesCount[0]?.count || 0,
		goals: goalsCount[0]?.count || 0,
		transactions: transactionsCount[0]?.count || 0,
	}
}

export async function getIncomeVsExpense(year: number, month: number) {
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const [incomeResult, expenseResult] = await Promise.all([
		db
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
			),
		db
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
			),
	])

	return {
		income: parseFloat(incomeResult[0]?.total || '0'),
		expense: parseFloat(expenseResult[0]?.total || '0'),
	}
}

// Yearly functions
export async function getYearlyIncome(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

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

export async function getYearlyExpense(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

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

export async function getMonthlyExpensesForYear(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	const results = await db
		.select({
			month: sql<number>`EXTRACT(MONTH FROM ${transactions.date})::int`,
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
		.groupBy(sql`EXTRACT(MONTH FROM ${transactions.date})`)
		.orderBy(sql`EXTRACT(MONTH FROM ${transactions.date})`)

	return results.map((r) => ({
		month: r.month,
		total: parseFloat(r.total || '0'),
	}))
}

export async function getYearlyIncomeVsExpense(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	const [incomeResult, expenseResult] = await Promise.all([
		db
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
			),
		db
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
			),
	])

	return {
		income: parseFloat(incomeResult[0]?.total || '0'),
		expense: parseFloat(expenseResult[0]?.total || '0'),
	}
}

export async function getYearlyTopExpensesByCategory(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	const results = await db
		.select({
			categoryName: categories.name,
			total: sum(transactions.amount),
			currency: sql<string>`MAX(${transactions.currency})`.as('currency'),
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(categories.name)
		.orderBy(desc(sum(transactions.amount)))
		.limit(5)

	return results.map((r) => ({
		categoryName: r.categoryName || 'Uncategorized',
		total: parseFloat(r.total || '0'),
		currency: r.currency || DEFAULT_CURRENCY,
	}))
}

export async function getYearlyFrequentExpenses(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	const results = await db
		.select({
			description: transactions.description,
			amount: transactions.amount,
			categoryName: categories.name,
			currency: transactions.currency,
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, true),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.orderBy(desc(transactions.date))
		.limit(5)

	return results.map((r) => ({
		description: r.description,
		amount: parseFloat(r.amount || '0'),
		categoryName: r.categoryName,
		currency: r.currency || DEFAULT_CURRENCY,
	}))
}

export async function getYearlySingleExpenses(year: number) {
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	const results = await db
		.select({
			description: transactions.description,
			amount: transactions.amount,
			categoryName: categories.name,
			currency: transactions.currency,
			date: transactions.date,
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.userId, userId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, false),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.orderBy(desc(transactions.amount))
		.limit(5)

	return results.map((r) => ({
		description: r.description,
		amount: parseFloat(r.amount || '0'),
		categoryName: r.categoryName,
		currency: r.currency || DEFAULT_CURRENCY,
		date: r.date,
	}))
}

