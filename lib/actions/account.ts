'use server'

import { db } from '@/db'
import { accounts, transactions, accountCurrencies } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const userId = 'user_1'

export async function createAccount(formData: {
	name: string
	type: 'CURRENT' | 'SAVINGS' | 'CASH'
	balance: string
	color: string
	currency: string
	currencies?: Array<{ currency: string; balance: string }>
	cardImage?: string
}) {
	try {
		const [account] = await db
			.insert(accounts)
			.values({
				name: formData.name,
				type: formData.type,
				balance: formData.balance,
				color: formData.color,
				currency: formData.currency,
				cardImage: formData.cardImage || null,
				userId,
			})
			.returning()

		// Insert additional currencies if provided
		if (formData.currencies && formData.currencies.length > 0) {
			await db.insert(accountCurrencies).values(
				formData.currencies.map((curr) => ({
					accountId: account.id,
					currency: curr.currency,
					balance: curr.balance,
					userId,
				}))
			)
		}

		revalidatePath('/accounts')
		revalidatePath('/')

		return { success: true, account }
	} catch (error) {
		console.error('Error creating account:', error)
		return { success: false, error: 'Failed to create account' }
	}
}

export async function updateAccount(
	accountId: string,
	formData: {
		name: string
		type: 'CURRENT' | 'SAVINGS' | 'CASH'
		color: string
		currency: string
		balance?: string
		currencies?: Array<{ currency: string; balance: string }>
		cardImage?: string
	}
) {
	try {
		const updateData: {
			name: string
			type: 'CURRENT' | 'SAVINGS' | 'CASH'
			color: string
			currency: string
			balance?: string
			cardImage?: string | null
		} = {
			name: formData.name,
			type: formData.type,
			color: formData.color,
			currency: formData.currency,
		}

		if (formData.balance !== undefined) {
			updateData.balance = formData.balance
		}

		if (formData.cardImage !== undefined) {
			updateData.cardImage = formData.cardImage || null
		}

		const [account] = await db
			.update(accounts)
			.set(updateData)
			.where(eq(accounts.id, accountId))
			.returning()

		// Update additional currencies
		if (formData.currencies !== undefined) {
			// Delete existing additional currencies
			await db.delete(accountCurrencies).where(eq(accountCurrencies.accountId, accountId))

			// Insert new additional currencies
			if (formData.currencies.length > 0) {
				await db.insert(accountCurrencies).values(
					formData.currencies.map((curr) => ({
						accountId: account.id,
						currency: curr.currency,
						balance: curr.balance,
						userId,
					}))
				)
			}
		}

		revalidatePath('/accounts')
		revalidatePath('/')
		revalidatePath('/transactions')

		return { success: true, account }
	} catch (error) {
		console.error('Error updating account:', error)
		return { success: false, error: 'Failed to update account' }
	}
}

export async function deleteAccount(accountId: string) {
	try {
		// Check if account has transactions
		const accountTransactions = await db
			.select()
			.from(transactions)
			.where(eq(transactions.accountId, accountId))
			.limit(1)

		if (accountTransactions.length > 0) {
			return {
				success: false,
				error: 'Cannot delete account with existing transactions',
			}
		}

		await db.delete(accounts).where(eq(accounts.id, accountId))

		revalidatePath('/accounts')
		revalidatePath('/')
		revalidatePath('/transactions')

		return { success: true }
	} catch (error) {
		console.error('Error deleting account:', error)
		return { success: false, error: 'Failed to delete account' }
	}
}

