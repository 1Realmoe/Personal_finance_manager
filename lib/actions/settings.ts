'use server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { CurrencyCode } from '@/lib/currency'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Update the user's base currency preference
 */
export async function updateBaseCurrency(currency: CurrencyCode): Promise<void> {
	const clerkUserId = await getCurrentUserId()
	
	await db
		.update(users)
		.set({
			baseCurrency: currency,
			updatedAt: new Date(),
		})
		.where(eq(users.clerkUserId, clerkUserId))

	revalidatePath('/dashboard/settings')
	revalidatePath('/dashboard')
}

/**
 * Delete user account and all associated data
 * This will cascade delete all related records
 */
export async function deleteAccount(): Promise<void> {
	const clerkUserId = await getCurrentUserId()
	
	// Delete user from our database (cascade will handle related data)
	await db
		.delete(users)
		.where(eq(users.clerkUserId, clerkUserId))

	// Delete user from Clerk
	const clerk = await clerkClient()
	await clerk.users.deleteUser(clerkUserId)

	revalidatePath('/dashboard')
}

