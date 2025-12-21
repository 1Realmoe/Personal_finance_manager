import { db } from '@/db'
import { DEFAULT_CURRENCY, CurrencyCode } from '@/lib/currency'
import { transactions, categories, accounts, goals } from '@/db/schema'
import { eq, and, gte, lte, sql, sum, count, desc, or, isNull } from 'drizzle-orm'
import { convertAndSum } from '@/lib/exchange'
import { getUserBaseCurrency } from '@/lib/actions/user'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function getMonthlyIncome(year: number, month: number) {
	const clerkUserId = await getCurrentUserId()
	// month is 1-indexed (1-12), JavaScript Date uses 0-indexed months (0-11)
	// Use UTC to avoid timezone issues
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	// Get last day of the month by using day 0 of next month
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	// Group by currency and sum in SQL
	const groupedResults = await db
		.select({
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'INCOME'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(transactions.currency)

	// Get base currency and convert all amounts
	const baseCurrency = await getUserBaseCurrency()
	const amountsByCurrency = groupedResults.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	return convertAndSum(amountsByCurrency, baseCurrency)
}

export async function getMonthlyExpense(year: number, month: number) {
	const clerkUserId = await getCurrentUserId()
	// Use UTC to avoid timezone issues
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	// Group by currency and sum in SQL
	const groupedResults = await db
		.select({
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(transactions.currency)

	// Get base currency and convert all amounts
	const baseCurrency = await getUserBaseCurrency()
	const amountsByCurrency = groupedResults.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	return convertAndSum(amountsByCurrency, baseCurrency)
}

export async function getDailyExpensesForMonth(year: number, month: number) {
	const clerkUserId = await getCurrentUserId()
	// Use UTC to avoid timezone issues
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	// Group by date AND currency, then sum in SQL
	const groupedResults = await db
		.select({
			date: sql<string>`(${transactions.date})::date`,
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(sql`(${transactions.date})::date`, transactions.currency)
		.orderBy(sql`(${transactions.date})::date`)

	// Get base currency
	const baseCurrency = await getUserBaseCurrency()

	// Group by date and convert amounts
	const dateMap = new Map<string, Array<{ currency: CurrencyCode; amount: number }>>()

	for (const r of groupedResults) {
		const date = r.date
		if (!dateMap.has(date)) {
			dateMap.set(date, [])
		}
		dateMap.get(date)!.push({
			currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
			amount: parseFloat(r.total || '0'),
		})
	}

	// Convert each date's amounts and return
	const results = await Promise.all(
		Array.from(dateMap.entries()).map(async ([date, amounts]) => ({
			date,
			total: await convertAndSum(amounts, baseCurrency),
		}))
	)

	return results.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getFrequentExpenses(year: number, month: number) {
	const clerkUserId = await getCurrentUserId()
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
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, true),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate),
				// Only include categories that belong to the user, or null (uncategorized)
				or(
					eq(categories.clerkUserId, clerkUserId),
					isNull(categories.id)
				)
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
	const clerkUserId = await getCurrentUserId()
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
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, false),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate),
				// Only include categories that belong to the user, or null (uncategorized)
				or(
					eq(categories.clerkUserId, clerkUserId),
					isNull(categories.id)
				)
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
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	// Group by category AND currency, then sum in SQL
	// LEFT JOIN should only match on categoryId, then filter in WHERE clause
	const groupedResults = await db
		.select({
			categoryName: categories.name,
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate),
				// Only include categories that belong to the user, or null (uncategorized)
				or(
					eq(categories.clerkUserId, clerkUserId),
					isNull(categories.id)
				)
			)
		)
		.groupBy(categories.name, transactions.currency)

	// Get base currency
	const baseCurrency = await getUserBaseCurrency()

	// Group by category and convert amounts
	const categoryMap = new Map<string, Array<{ currency: CurrencyCode; amount: number }>>()

	for (const r of groupedResults) {
		const categoryName = r.categoryName || 'Uncategorized'
		if (!categoryMap.has(categoryName)) {
			categoryMap.set(categoryName, [])
		}
		categoryMap.get(categoryName)!.push({
			currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
			amount: parseFloat(r.total || '0'),
		})
	}

	// Convert each category's amounts and return, sorted by total
	const results = await Promise.all(
		Array.from(categoryMap.entries()).map(async ([categoryName, amounts]) => ({
			categoryName,
			total: await convertAndSum(amounts, baseCurrency),
			currency: baseCurrency,
		}))
	)

	return results.sort((a, b) => b.total - a.total).slice(0, 5)
}

export async function getOverviewStats() {
	const clerkUserId = await getCurrentUserId()
	const [accountsCount, categoriesCount, goalsCount, transactionsCount] = await Promise.all([
		db.select({ count: count() }).from(accounts).where(eq(accounts.clerkUserId, clerkUserId)),
		db.select({ count: count() }).from(categories).where(eq(categories.clerkUserId, clerkUserId)),
		db.select({ count: count() }).from(goals).where(eq(goals.clerkUserId, clerkUserId)),
		db.select({ count: count() }).from(transactions).where(eq(transactions.clerkUserId, clerkUserId)),
	])

	return {
		accounts: accountsCount[0]?.count || 0,
		categories: categoriesCount[0]?.count || 0,
		goals: goalsCount[0]?.count || 0,
		transactions: transactionsCount[0]?.count || 0,
	}
}

export async function getIncomeVsExpense(year: number, month: number) {
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

	const baseCurrency = await getUserBaseCurrency()

	const [incomeGrouped, expenseGrouped] = await Promise.all([
		db
			.select({
				currency: transactions.currency,
				total: sum(transactions.amount),
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.clerkUserId, clerkUserId),
					eq(transactions.type, 'INCOME'),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate)
				)
			)
			.groupBy(transactions.currency),
		db
			.select({
				currency: transactions.currency,
				total: sum(transactions.amount),
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.clerkUserId, clerkUserId),
					eq(transactions.type, 'EXPENSE'),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate)
				)
			)
			.groupBy(transactions.currency),
	])

	const incomeAmounts = incomeGrouped.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	const expenseAmounts = expenseGrouped.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	const [income, expense] = await Promise.all([
		convertAndSum(incomeAmounts, baseCurrency),
		convertAndSum(expenseAmounts, baseCurrency),
	])

	return { income, expense }
}

// Yearly functions
export async function getYearlyIncome(year: number) {
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	// Group by currency and sum in SQL
	const groupedResults = await db
		.select({
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'INCOME'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(transactions.currency)

	// Get base currency and convert all amounts
	const baseCurrency = await getUserBaseCurrency()
	const amountsByCurrency = groupedResults.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	return convertAndSum(amountsByCurrency, baseCurrency)
}

export async function getYearlyExpense(year: number) {
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	// Group by currency and sum in SQL
	const groupedResults = await db
		.select({
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(transactions.currency)

	// Get base currency and convert all amounts
	const baseCurrency = await getUserBaseCurrency()
	const amountsByCurrency = groupedResults.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	return convertAndSum(amountsByCurrency, baseCurrency)
}

export async function getMonthlyExpensesForYear(year: number) {
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	// Group by month AND currency, then sum in SQL
	const groupedResults = await db
		.select({
			month: sql<number>`EXTRACT(MONTH FROM ${transactions.date})::int`,
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.groupBy(sql`EXTRACT(MONTH FROM ${transactions.date})`, transactions.currency)
		.orderBy(sql`EXTRACT(MONTH FROM ${transactions.date})`)

	// Get base currency
	const baseCurrency = await getUserBaseCurrency()

	// Group by month and convert amounts
	const monthMap = new Map<number, Array<{ currency: CurrencyCode; amount: number }>>()

	for (const r of groupedResults) {
		const month = r.month
		if (!monthMap.has(month)) {
			monthMap.set(month, [])
		}
		monthMap.get(month)!.push({
			currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
			amount: parseFloat(r.total || '0'),
		})
	}

	// Convert each month's amounts and return
	const results = await Promise.all(
		Array.from(monthMap.entries()).map(async ([month, amounts]) => ({
			month,
			total: await convertAndSum(amounts, baseCurrency),
		}))
	)

	return results.sort((a, b) => a.month - b.month)
}

export async function getYearlyIncomeVsExpense(year: number) {
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	const baseCurrency = await getUserBaseCurrency()

	const [incomeGrouped, expenseGrouped] = await Promise.all([
		db
			.select({
				currency: transactions.currency,
				total: sum(transactions.amount),
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.clerkUserId, clerkUserId),
					eq(transactions.type, 'INCOME'),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate)
				)
			)
			.groupBy(transactions.currency),
		db
			.select({
				currency: transactions.currency,
				total: sum(transactions.amount),
			})
			.from(transactions)
			.where(
				and(
					eq(transactions.clerkUserId, clerkUserId),
					eq(transactions.type, 'EXPENSE'),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate)
				)
			)
			.groupBy(transactions.currency),
	])

	const incomeAmounts = incomeGrouped.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	const expenseAmounts = expenseGrouped.map((r) => ({
		currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
		amount: parseFloat(r.total || '0'),
	}))

	const [income, expense] = await Promise.all([
		convertAndSum(incomeAmounts, baseCurrency),
		convertAndSum(expenseAmounts, baseCurrency),
	])

	return { income, expense }
}

export async function getYearlyTopExpensesByCategory(year: number) {
	const clerkUserId = await getCurrentUserId()
	const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0))
	const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

	// Group by category AND currency, then sum in SQL
	// LEFT JOIN should only match on categoryId, then filter in WHERE clause
	const groupedResults = await db
		.select({
			categoryName: categories.name,
			currency: transactions.currency,
			total: sum(transactions.amount),
		})
		.from(transactions)
		.leftJoin(categories, eq(transactions.categoryId, categories.id))
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate),
				// Only include categories that belong to the user, or null (uncategorized)
				or(
					eq(categories.clerkUserId, clerkUserId),
					isNull(categories.id)
				)
			)
		)
		.groupBy(categories.name, transactions.currency)

	// Get base currency
	const baseCurrency = await getUserBaseCurrency()

	// Group by category and convert amounts
	const categoryMap = new Map<string, Array<{ currency: CurrencyCode; amount: number }>>()

	for (const r of groupedResults) {
		const categoryName = r.categoryName || 'Uncategorized'
		if (!categoryMap.has(categoryName)) {
			categoryMap.set(categoryName, [])
		}
		categoryMap.get(categoryName)!.push({
			currency: (r.currency || DEFAULT_CURRENCY) as CurrencyCode,
			amount: parseFloat(r.total || '0'),
		})
	}

	// Convert each category's amounts and return, sorted by total
	const results = await Promise.all(
		Array.from(categoryMap.entries()).map(async ([categoryName, amounts]) => ({
			categoryName,
			total: await convertAndSum(amounts, baseCurrency),
			currency: baseCurrency,
		}))
	)

	return results.sort((a, b) => b.total - a.total).slice(0, 5)
}

export async function getYearlyFrequentExpenses(year: number) {
	const clerkUserId = await getCurrentUserId()
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
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, true),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate),
				// Only include categories that belong to the user, or null (uncategorized)
				or(
					eq(categories.clerkUserId, clerkUserId),
					isNull(categories.id)
				)
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
	const clerkUserId = await getCurrentUserId()
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
				eq(transactions.clerkUserId, clerkUserId),
				eq(transactions.type, 'EXPENSE'),
				eq(transactions.isRecurrent, false),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate),
				// Only include categories that belong to the user, or null (uncategorized)
				or(
					eq(categories.clerkUserId, clerkUserId),
					isNull(categories.id)
				)
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

