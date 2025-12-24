'use server'

import { db } from '@/db'
import { transactions, accounts } from '@/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function createTransaction(formData: {
	amount: string
	description: string
	date: Date
	accountId: string
	toAccountId?: string | null
	categoryId?: string | null
	type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
	currency: string
	sourceId?: string | null
	isRecurrent?: boolean
	recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
	receiptImage?: string | null
}) {
	try {
		const clerkUserId = await getCurrentUserId()
		
		// Verify from account belongs to user
		const [fromAccount] = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.id, formData.accountId),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!fromAccount) {
			return { success: false, error: 'Account not found' }
		}

		// For transfers, verify to account belongs to user
		if (formData.type === 'TRANSFER') {
			if (!formData.toAccountId) {
				return { success: false, error: 'Destination account is required for transfers' }
			}

			if (formData.accountId === formData.toAccountId) {
				return { success: false, error: 'Cannot transfer to the same account' }
			}

			const [toAccount] = await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.id, formData.toAccountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
				.limit(1)

			if (!toAccount) {
				return { success: false, error: 'Destination account not found' }
			}
		}

		// Insert transaction
		const [transaction] = await db
			.insert(transactions)
			.values({
				amount: formData.amount,
				description: formData.description,
				date: formData.date,
				accountId: formData.accountId,
				toAccountId: formData.type === 'TRANSFER' ? formData.toAccountId || null : null,
				categoryId: formData.categoryId || null,
				type: formData.type,
				currency: formData.currency,
				sourceId: formData.sourceId || null,
				isRecurrent: formData.isRecurrent || false,
				recurrenceFrequency: formData.recurrenceFrequency || null,
				receiptImage: formData.receiptImage || null,
				clerkUserId,
			})
			.returning()

		// Update account balance(s)
		const amount = parseFloat(formData.amount)
		
		if (formData.type === 'TRANSFER') {
			// For transfers: decrease from account, increase to account
			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} - ${amount}`,
				})
				.where(
					and(
						eq(accounts.id, formData.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${amount}`,
				})
				.where(
					and(
						eq(accounts.id, formData.toAccountId!),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		} else {
			// For income/expense: update single account
			const balanceChange = formData.type === 'INCOME' ? amount : -amount

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${balanceChange}`,
				})
				.where(
					and(
						eq(accounts.id, formData.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		}

		revalidatePath('/dashboard')
		revalidatePath('/transactions')
		revalidatePath('/accounts')

		return { success: true, transaction }
	} catch (error) {
		console.error('Error creating transaction:', error)
		return { success: false, error: 'Failed to create transaction' }
	}
}

export async function updateTransaction(
	transactionId: string,
	formData: {
		amount: string
		description: string
		date: Date
		accountId: string
		toAccountId?: string | null
		categoryId?: string | null
		type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
		currency: string
		sourceId?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
		receiptImage?: string | null
	}
) {
	try {
		const clerkUserId = await getCurrentUserId()
		
		// Get old transaction details to revert balance changes
		const [oldTransaction] = await db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.id, transactionId),
					eq(transactions.clerkUserId, clerkUserId)
				)
			)

		if (!oldTransaction) {
			return { success: false, error: 'Transaction not found' }
		}

		// Revert old transaction's effect on account balance(s)
		const oldAmount = parseFloat(oldTransaction.amount)
		
		if (oldTransaction.type === 'TRANSFER' && oldTransaction.toAccountId) {
			// Revert transfer: increase from account, decrease to account
			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${oldAmount}`,
				})
				.where(
					and(
						eq(accounts.id, oldTransaction.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} - ${oldAmount}`,
				})
				.where(
					and(
						eq(accounts.id, oldTransaction.toAccountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		} else {
			// Revert income/expense
			const oldBalanceChange = oldTransaction.type === 'INCOME' ? -oldAmount : oldAmount

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${oldBalanceChange}`,
				})
				.where(
					and(
						eq(accounts.id, oldTransaction.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		}

		// For transfers, verify to account belongs to user
		if (formData.type === 'TRANSFER') {
			if (!formData.toAccountId) {
				return { success: false, error: 'Destination account is required for transfers' }
			}

			if (formData.accountId === formData.toAccountId) {
				return { success: false, error: 'Cannot transfer to the same account' }
			}

			const [toAccount] = await db
				.select()
				.from(accounts)
				.where(
					and(
						eq(accounts.id, formData.toAccountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
				.limit(1)

			if (!toAccount) {
				return { success: false, error: 'Destination account not found' }
			}
		}

		// Verify from account belongs to user
		const [fromAccount] = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.id, formData.accountId),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!fromAccount) {
			return { success: false, error: 'Account not found' }
		}

		// Update transaction
		const [transaction] = await db
			.update(transactions)
			.set({
				amount: formData.amount,
				description: formData.description,
				date: formData.date,
				accountId: formData.accountId,
				toAccountId: formData.type === 'TRANSFER' ? formData.toAccountId || null : null,
				categoryId: formData.categoryId || null,
				type: formData.type,
				currency: formData.currency,
				sourceId: formData.sourceId || null,
				isRecurrent: formData.isRecurrent || false,
				recurrenceFrequency: formData.recurrenceFrequency || null,
				receiptImage: formData.receiptImage !== undefined ? formData.receiptImage : undefined,
			})
			.where(
				and(
					eq(transactions.id, transactionId),
					eq(transactions.clerkUserId, clerkUserId)
				)
			)
			.returning()

		// Apply new transaction's effect on account balance(s)
		const newAmount = parseFloat(formData.amount)
		
		if (formData.type === 'TRANSFER') {
			// For transfers: decrease from account, increase to account
			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} - ${newAmount}`,
				})
				.where(
					and(
						eq(accounts.id, formData.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${newAmount}`,
				})
				.where(
					and(
						eq(accounts.id, formData.toAccountId!),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		} else {
			// For income/expense: update single account
			const newBalanceChange = formData.type === 'INCOME' ? newAmount : -newAmount

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${newBalanceChange}`,
				})
				.where(
					and(
						eq(accounts.id, formData.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		}

		revalidatePath('/dashboard')
		revalidatePath('/transactions')
		revalidatePath('/accounts')

		return { success: true, transaction }
	} catch (error) {
		console.error('Error updating transaction:', error)
		return { success: false, error: 'Failed to update transaction' }
	}
}

export async function deleteTransaction(transactionId: string) {
	try {
		const clerkUserId = await getCurrentUserId()
		
		// Get transaction details first to update account balance
		const [transaction] = await db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.id, transactionId),
					eq(transactions.clerkUserId, clerkUserId)
				)
			)

		if (!transaction) {
			return { success: false, error: 'Transaction not found' }
		}

		// Delete transaction
		await db
			.delete(transactions)
			.where(
				and(
					eq(transactions.id, transactionId),
					eq(transactions.clerkUserId, clerkUserId)
				)
			)

		// Revert account balance(s)
		const amount = parseFloat(transaction.amount)
		
		if (transaction.type === 'TRANSFER' && transaction.toAccountId) {
			// Revert transfer: increase from account, decrease to account
			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${amount}`,
				})
				.where(
					and(
						eq(accounts.id, transaction.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} - ${amount}`,
				})
				.where(
					and(
						eq(accounts.id, transaction.toAccountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		} else {
			// Revert income/expense
			const balanceChange = transaction.type === 'INCOME' ? -amount : amount

			await db
				.update(accounts)
				.set({
					balance: sql`${accounts.balance} + ${balanceChange}`,
				})
				.where(
					and(
						eq(accounts.id, transaction.accountId),
						eq(accounts.clerkUserId, clerkUserId)
					)
				)
		}

		revalidatePath('/dashboard')
		revalidatePath('/transactions')
		revalidatePath('/accounts')

		return { success: true }
	} catch (error) {
		console.error('Error deleting transaction:', error)
		return { success: false, error: 'Failed to delete transaction' }
	}
}

