import { db } from '@/db'
import { transactions, accounts, categories, sources } from '@/db/schema'
import { eq, desc, and, gte, lte, inArray } from 'drizzle-orm'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function getTransactions(limit?: number) {
	const clerkUserId = await getCurrentUserId()
	
	const results = await db
		.select({
			id: transactions.id,
			amount: transactions.amount,
			description: transactions.description,
			date: transactions.date,
			type: transactions.type,
			accountId: transactions.accountId,
			accountName: accounts.name,
			toAccountId: transactions.toAccountId,
			categoryId: transactions.categoryId,
			categoryName: categories.name,
			currency: transactions.currency,
			sourceId: transactions.sourceId,
			sourceName: sources.name,
			isRecurrent: transactions.isRecurrent,
			recurrenceFrequency: transactions.recurrenceFrequency,
			receiptImage: transactions.receiptImage,
		})
		.from(transactions)
		.leftJoin(accounts, and(
			eq(transactions.accountId, accounts.id),
			eq(accounts.clerkUserId, clerkUserId)
		))
		.leftJoin(categories, and(
			eq(transactions.categoryId, categories.id),
			eq(categories.clerkUserId, clerkUserId)
		))
		.leftJoin(sources, and(
			eq(transactions.sourceId, sources.id),
			eq(sources.clerkUserId, clerkUserId)
		))
		.where(eq(transactions.clerkUserId, clerkUserId))
		.orderBy(desc(transactions.date))
		.limit(limit || 100)

	// Fetch toAccount names for transfers
	const toAccountIds = results
		.map((r) => r.toAccountId)
		.filter((id): id is string => id !== null && id !== undefined)
	
	const toAccountNamesMap = new Map<string, string>()
	if (toAccountIds.length > 0) {
		const toAccounts = await db
			.select({
				id: accounts.id,
				name: accounts.name,
			})
			.from(accounts)
			.where(
				and(
					inArray(accounts.id, toAccountIds),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)
		
		toAccounts.forEach((account) => {
			toAccountNamesMap.set(account.id, account.name)
		})
	}

	// Add toAccountName to results
	return results.map((result) => ({
		...result,
		toAccountName: result.toAccountId ? toAccountNamesMap.get(result.toAccountId) || null : null,
	}))
}

export async function getRecentTransactions(count: number = 5) {
	return getTransactions(count)
}

export async function getTransactionsByMonth(year: number, month: number) {
	const clerkUserId = await getCurrentUserId()
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
			toAccountId: transactions.toAccountId,
			categoryId: transactions.categoryId,
			categoryName: categories.name,
			currency: transactions.currency,
			sourceId: transactions.sourceId,
			sourceName: sources.name,
			isRecurrent: transactions.isRecurrent,
			recurrenceFrequency: transactions.recurrenceFrequency,
			receiptImage: transactions.receiptImage,
		})
		.from(transactions)
		.leftJoin(accounts, and(
			eq(transactions.accountId, accounts.id),
			eq(accounts.clerkUserId, clerkUserId)
		))
		.leftJoin(categories, and(
			eq(transactions.categoryId, categories.id),
			eq(categories.clerkUserId, clerkUserId)
		))
		.leftJoin(sources, and(
			eq(transactions.sourceId, sources.id),
			eq(sources.clerkUserId, clerkUserId)
		))
		.where(
			and(
				eq(transactions.clerkUserId, clerkUserId),
				gte(transactions.date, startDate),
				lte(transactions.date, endDate)
			)
		)
		.orderBy(desc(transactions.date))

	// Fetch toAccount names for transfers
	const toAccountIds = results
		.map((r) => r.toAccountId)
		.filter((id): id is string => id !== null && id !== undefined)
	
	const toAccountNamesMap = new Map<string, string>()
	if (toAccountIds.length > 0) {
		const toAccounts = await db
			.select({
				id: accounts.id,
				name: accounts.name,
			})
			.from(accounts)
			.where(
				and(
					inArray(accounts.id, toAccountIds),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)
		
		toAccounts.forEach((account) => {
			toAccountNamesMap.set(account.id, account.name)
		})
	}

	// Add toAccountName to results
	return results.map((result) => ({
		...result,
		toAccountName: result.toAccountId ? toAccountNamesMap.get(result.toAccountId) || null : null,
	}))
}

