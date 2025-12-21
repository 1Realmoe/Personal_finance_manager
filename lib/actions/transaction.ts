'use server'

import { db } from '@/db'
import { transactions, accounts } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const userId = 'user_1'

export async function createTransaction(formData: {
	amount: string
	description: string
	date: Date
	accountId: string
	categoryId?: string | null
	type: 'INCOME' | 'EXPENSE'
	currency: string
	source?: string | null
	isRecurrent?: boolean
	recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
}) {
	try {
		// Insert transaction
		const [transaction] = await db
			.insert(transactions)
			.values({
				amount: formData.amount,
				description: formData.description,
				date: formData.date,
				accountId: formData.accountId,
				categoryId: formData.categoryId || null,
				type: formData.type,
				currency: formData.currency,
				source: formData.source || null,
				isRecurrent: formData.isRecurrent || false,
				recurrenceFrequency: formData.recurrenceFrequency || null,
				userId,
			})
			.returning()

		// Update account balance using SQL
		const amount = parseFloat(formData.amount)
		const balanceChange = formData.type === 'INCOME' ? amount : -amount

		await db
			.update(accounts)
			.set({
				balance: sql`${accounts.balance} + ${balanceChange}`,
			})
			.where(eq(accounts.id, formData.accountId))

		revalidatePath('/')
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
		categoryId?: string | null
		type: 'INCOME' | 'EXPENSE'
		currency: string
		source?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
	}
) {
	try {
		// Get old transaction details to revert balance changes
		const [oldTransaction] = await db
			.select()
			.from(transactions)
			.where(eq(transactions.id, transactionId))

		if (!oldTransaction) {
			return { success: false, error: 'Transaction not found' }
		}

		// Revert old transaction's effect on account balance
		const oldAmount = parseFloat(oldTransaction.amount)
		const oldBalanceChange = oldTransaction.type === 'INCOME' ? -oldAmount : oldAmount

		await db
			.update(accounts)
			.set({
				balance: sql`${accounts.balance} + ${oldBalanceChange}`,
			})
			.where(eq(accounts.id, oldTransaction.accountId))

		// Update transaction
		const [transaction] = await db
			.update(transactions)
			.set({
				amount: formData.amount,
				description: formData.description,
				date: formData.date,
				accountId: formData.accountId,
				categoryId: formData.categoryId || null,
				type: formData.type,
				currency: formData.currency,
				source: formData.source || null,
				isRecurrent: formData.isRecurrent || false,
				recurrenceFrequency: formData.recurrenceFrequency || null,
			})
			.where(eq(transactions.id, transactionId))
			.returning()

		// Apply new transaction's effect on account balance
		const newAmount = parseFloat(formData.amount)
		const newBalanceChange = formData.type === 'INCOME' ? newAmount : -newAmount

		await db
			.update(accounts)
			.set({
				balance: sql`${accounts.balance} + ${newBalanceChange}`,
			})
			.where(eq(accounts.id, formData.accountId))

		// If account changed, also update the old account balance
		if (oldTransaction.accountId !== formData.accountId) {
			// Old account balance was already reverted above, no need to do anything
		}

		revalidatePath('/')
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
		// Get transaction details first to update account balance
		const [transaction] = await db
			.select()
			.from(transactions)
			.where(eq(transactions.id, transactionId))

		if (!transaction) {
			return { success: false, error: 'Transaction not found' }
		}

		// Delete transaction
		await db.delete(transactions).where(eq(transactions.id, transactionId))

		// Revert account balance
		const amount = parseFloat(transaction.amount)
		const balanceChange = transaction.type === 'INCOME' ? -amount : amount

		await db
			.update(accounts)
			.set({
				balance: sql`${accounts.balance} + ${balanceChange}`,
			})
			.where(eq(accounts.id, transaction.accountId))

		revalidatePath('/')
		revalidatePath('/transactions')
		revalidatePath('/accounts')

		return { success: true }
	} catch (error) {
		console.error('Error deleting transaction:', error)
		return { success: false, error: 'Failed to delete transaction' }
	}
}

