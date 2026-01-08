'use server'

import { db } from '@/db'
import { transactions, accounts } from '@/db/schema'
import { eq, sql, and, isNull, gte, lte } from 'drizzle-orm'
import { addDays, addWeeks, addMonths, addYears, startOfDay, endOfDay, format } from 'date-fns'

/**
 * Calculate the next occurrence date based on frequency and the original date
 */
function getNextOccurrenceDate(
	originalDate: Date,
	frequency: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY',
	referenceDate: Date = new Date()
): Date | null {
	const original = new Date(originalDate)
	const reference = new Date(referenceDate)

	switch (frequency) {
		case 'DAILY': {
			// Find the next occurrence on or after today
			let nextDate = new Date(original)
			while (nextDate < reference) {
				nextDate = addDays(nextDate, 1)
			}
			return nextDate
		}
		case 'WEEKLY': {
			// Find the next occurrence on the same day of week
			let nextDate = new Date(original)
			while (nextDate < reference) {
				nextDate = addWeeks(nextDate, 1)
			}
			return nextDate
		}
		case 'MONTHLY': {
			// Find the next occurrence on the same day of month
			let nextDate = new Date(original)
			while (nextDate < reference) {
				nextDate = addMonths(nextDate, 1)
			}
			return nextDate
		}
		case 'YEARLY': {
			// Find the next occurrence on the same month and day
			let nextDate = new Date(original)
			while (nextDate < reference) {
				nextDate = addYears(nextDate, 1)
			}
			return nextDate
		}
		default:
			return null
	}
}

/**
 * Check if a transaction already exists for a given recurring transaction and date
 */
async function transactionExistsForDate(
	parentTransactionId: string,
	targetDate: Date,
	clerkUserId: string
): Promise<boolean> {
	const startOfTargetDay = startOfDay(targetDate)
	const endOfTargetDay = endOfDay(targetDate)

	const existing = await db
		.select()
		.from(transactions)
		.where(
			and(
				eq(transactions.parentRecurringTransactionId, parentTransactionId),
				eq(transactions.clerkUserId, clerkUserId),
				gte(transactions.date, startOfTargetDay),
				lte(transactions.date, endOfTargetDay)
			)
		)
		.limit(1)

	return existing.length > 0
}

/**
 * Process all recurring transactions and create new ones as needed
 */
export async function processRecurringTransactions() {
	try {
		const now = new Date()
		const today = startOfDay(now)

		// Get all active recurring transactions (templates)
		const recurringTemplatesResult = await db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.isRecurrent, true),
					isNull(transactions.parentRecurringTransactionId) // Only get templates, not generated ones
				)
			)

		// Ensure we have an array to iterate over
		const recurringTemplates: typeof recurringTemplatesResult = Array.isArray(recurringTemplatesResult) 
			? recurringTemplatesResult 
			: []

		let processedCount = 0
		let createdCount = 0
		const errors: string[] = []

		for (const template of recurringTemplates) {
			if (!template.recurrenceFrequency) {
				continue
			}

			try {
				// Calculate the next occurrence date
				const nextDate = getNextOccurrenceDate(
					template.date,
					template.recurrenceFrequency,
					today
				)

				if (!nextDate) {
					continue
				}

				// Only create if the next occurrence is today or overdue (catch up)
				// But not if it's too far in the future (only process current/overdue)
				const nextDateStart = startOfDay(nextDate)
				const todayStart = startOfDay(today)
				
				if (nextDateStart > todayStart) {
					// Skip if it's in the future
					continue
				}

				// Check if transaction already exists for this date
				const exists = await transactionExistsForDate(
					template.id,
					nextDate,
					template.clerkUserId
				)

				if (exists) {
					processedCount++
					continue
				}

				// Verify accounts still exist
				const [fromAccount] = await db
					.select()
					.from(accounts)
					.where(
						and(
							eq(accounts.id, template.accountId),
							eq(accounts.clerkUserId, template.clerkUserId)
						)
					)
					.limit(1)

				if (!fromAccount) {
					errors.push(`Account not found for recurring transaction ${template.id}`)
					continue
				}

				// For transfers, verify to account exists
				if (template.type === 'TRANSFER' && template.toAccountId) {
					const [toAccount] = await db
						.select()
						.from(accounts)
						.where(
							and(
								eq(accounts.id, template.toAccountId),
								eq(accounts.clerkUserId, template.clerkUserId)
							)
						)
						.limit(1)

					if (!toAccount) {
						errors.push(`Destination account not found for recurring transaction ${template.id}`)
						continue
					}
				}

				// Create the new transaction
				const newTransactionResult = await db
					.insert(transactions)
					.values({
						amount: template.amount,
						description: template.description,
						date: nextDate,
						accountId: template.accountId,
						toAccountId: template.toAccountId || null,
						categoryId: template.categoryId || null,
						type: template.type,
						currency: template.currency,
						sourceId: template.sourceId || null,
						isRecurrent: false, // Generated transactions are not recurring templates
						recurrenceFrequency: null,
						parentRecurringTransactionId: template.id, // Link to parent template
						receiptImage: null, // Don't copy receipt images
						clerkUserId: template.clerkUserId,
					})
					.returning()

				const newTransaction = Array.isArray(newTransactionResult) ? newTransactionResult[0] : null
				
				if (!newTransaction) {
					errors.push(`Failed to create transaction for recurring template ${template.id}`)
					continue
				}

				// Update account balance(s)
				const amount = parseFloat(template.amount)

				if (template.type === 'TRANSFER' && template.toAccountId) {
					// For transfers: decrease from account, increase to account
					await db
						.update(accounts)
						.set({
							balance: sql`${accounts.balance} - ${amount}`,
						})
						.where(
							and(
								eq(accounts.id, template.accountId),
								eq(accounts.clerkUserId, template.clerkUserId)
							)
						)

					await db
						.update(accounts)
						.set({
							balance: sql`${accounts.balance} + ${amount}`,
						})
						.where(
							and(
								eq(accounts.id, template.toAccountId),
								eq(accounts.clerkUserId, template.clerkUserId)
							)
						)
				} else {
					// For income/expense: update single account
					const balanceChange = template.type === 'INCOME' ? amount : -amount

					await db
						.update(accounts)
						.set({
							balance: sql`${accounts.balance} + ${balanceChange}`,
						})
						.where(
							and(
								eq(accounts.id, template.accountId),
								eq(accounts.clerkUserId, template.clerkUserId)
							)
						)
				}

				createdCount++
				processedCount++
			} catch (error) {
				const errorMessage = `Error processing recurring transaction ${template.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
				errors.push(errorMessage)
				console.error(errorMessage, error)
			}
		}

		return {
			success: true,
			processed: processedCount,
			created: createdCount,
			errors: errors.length > 0 ? errors : undefined,
		}
	} catch (error) {
		console.error('Error processing recurring transactions:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to process recurring transactions',
		}
	}
}
