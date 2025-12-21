'use server'

import { db } from '@/db'
import { accounts, transactions, accountCurrencies, holdings, investmentTransactions } from '@/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function createAccount(formData: {
	name: string
	type: 'CURRENT' | 'SAVINGS' | 'CASH' | 'INVESTMENT'
	balance: string
	color: string
	currency: string
	currencies?: Array<{ currency: string; balance: string }>
	cardImage?: string
}) {
	try {
		const clerkUserId = await getCurrentUserId()
		const [account] = await db
			.insert(accounts)
			.values({
				name: formData.name,
				type: formData.type,
				balance: formData.balance,
				color: formData.color,
				currency: formData.currency,
				cardImage: formData.cardImage || null,
				clerkUserId,
			})
			.returning()

		// Insert additional currencies if provided
		if (formData.currencies && formData.currencies.length > 0) {
			await db.insert(accountCurrencies).values(
				formData.currencies.map((curr) => ({
					accountId: account.id,
					currency: curr.currency,
					balance: curr.balance,
					clerkUserId,
				}))
			)
		}

		revalidatePath('/accounts')
		revalidatePath('/dashboard')

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
		type: 'CURRENT' | 'SAVINGS' | 'CASH' | 'INVESTMENT'
		color: string
		currency: string
		balance?: string
		currencies?: Array<{ currency: string; balance: string }>
		cardImage?: string
	}
) {
	try {
		const clerkUserId = await getCurrentUserId()
		const updateData: {
			name: string
			type: 'CURRENT' | 'SAVINGS' | 'CASH' | 'INVESTMENT'
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
			.where(
				and(
					eq(accounts.id, accountId),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)
			.returning()

		if (!account) {
			return { success: false, error: 'Account not found' }
		}

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
						clerkUserId,
					}))
				)
			}
		}

		revalidatePath('/accounts')
		revalidatePath('/dashboard')
		revalidatePath('/transactions')

		return { success: true, account }
	} catch (error) {
		console.error('Error updating account:', error)
		return { success: false, error: 'Failed to update account' }
	}
}

export async function deleteAccount(accountId: string) {
	try {
		const clerkUserId = await getCurrentUserId()
		
		// Verify account belongs to user
		const [account] = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.id, accountId),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!account) {
			return { success: false, error: 'Account not found' }
		}

		// Check if account has transactions (regular or investment)
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

		// For investment accounts, also check for holdings and investment transactions
		if (account.type === 'INVESTMENT') {
			const { holdings, investmentTransactions } = await import('@/db/schema')
			
			const accountHoldings = await db
				.select()
				.from(holdings)
				.where(eq(holdings.accountId, accountId))
				.limit(1)

			if (accountHoldings.length > 0) {
				return {
					success: false,
					error: 'Cannot delete investment account with existing holdings',
				}
			}

			const accountInvestmentTransactions = await db
				.select()
				.from(investmentTransactions)
				.where(eq(investmentTransactions.accountId, accountId))
				.limit(1)

			if (accountInvestmentTransactions.length > 0) {
				return {
					success: false,
					error: 'Cannot delete investment account with existing investment transactions',
				}
			}
		}

		await db
			.delete(accounts)
			.where(
				and(
					eq(accounts.id, accountId),
					eq(accounts.clerkUserId, clerkUserId)
				)
			)

		revalidatePath('/accounts')
		revalidatePath('/dashboard')
		revalidatePath('/transactions')
		revalidatePath('/dashboard/investments')

		return { success: true }
	} catch (error) {
		console.error('Error deleting account:', error)
		return { success: false, error: 'Failed to delete account' }
	}
}

