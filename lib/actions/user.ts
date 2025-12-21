'use server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId, syncUserToDatabase } from '@/lib/auth-helpers'

/**
 * Get the user's base currency for analytics display
 * Syncs user to database if doesn't exist
 */
export async function getUserBaseCurrency(): Promise<CurrencyCode> {
	try {
		// Ensure user is synced to database
		await syncUserToDatabase()
		
		const clerkUserId = await getCurrentUserId()
		
		// Fetch user's base currency
		const [user] = await db
			.select({ baseCurrency: users.baseCurrency })
			.from(users)
			.where(eq(users.clerkUserId, clerkUserId))
			.limit(1)

		if (user) {
			return user.baseCurrency as CurrencyCode
		}

		// Fallback to default if user not found (shouldn't happen after sync)
		return DEFAULT_CURRENCY
	} catch (error) {
		console.error('Error fetching user base currency:', error)
		return DEFAULT_CURRENCY
	}
}

/**
 * Update the user's base currency preference
 */
export async function updateUserBaseCurrency(currency: CurrencyCode): Promise<void> {
	try {
		// Ensure user is synced to database
		await syncUserToDatabase()
		
		const clerkUserId = await getCurrentUserId()
		
		// Update base currency
		await db
			.update(users)
			.set({
				baseCurrency: currency,
				updatedAt: new Date(),
			})
			.where(eq(users.clerkUserId, clerkUserId))

		// Revalidate dashboard and related pages
		revalidatePath('/dashboard')
		revalidatePath('/accounts')
		revalidatePath('/transactions')
	} catch (error) {
		console.error('Error updating user base currency:', error)
		throw new Error('Failed to update base currency')
	}
}

