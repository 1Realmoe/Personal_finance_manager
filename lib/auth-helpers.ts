'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Get the current Clerk user ID
 * Throws error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
	const { userId } = await auth()
	
	if (!userId) {
		throw new Error('User is not authenticated')
	}
	
	return userId
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<string> {
	return getCurrentUserId()
}

/**
 * Get current user from Clerk
 */
export async function getCurrentUser() {
	return currentUser()
}

/**
 * Sync Clerk user to our database
 * Creates user record if doesn't exist, updates if exists
 */
export async function syncUserToDatabase(): Promise<void> {
	const clerkUser = await currentUser()
	
	if (!clerkUser) {
		throw new Error('User is not authenticated')
	}

	const clerkUserId = clerkUser.id
	const email = clerkUser.emailAddresses[0]?.emailAddress || ''
	const name = clerkUser.firstName && clerkUser.lastName
		? `${clerkUser.firstName} ${clerkUser.lastName}`
		: clerkUser.firstName || clerkUser.lastName || null
	const avatar = clerkUser.imageUrl || null

	// Check if user exists first to avoid conflicts
	const [existingUser] = await db
		.select()
		.from(users)
		.where(eq(users.clerkUserId, clerkUserId))
		.limit(1)

	if (existingUser) {
		// Update existing user
		await db
			.update(users)
			.set({
				email,
				name,
				avatar,
				updatedAt: new Date(),
			})
			.where(eq(users.clerkUserId, clerkUserId))
	} else {
		// Create new user with error handling for race conditions
		try {
			await db.insert(users).values({
				clerkUserId,
				email,
				name,
				avatar,
				baseCurrency: 'USD', // Default currency
			})
		} catch (error: any) {
			// Handle race condition - another request might have created the user
			// Error code 23505 = unique_violation in PostgreSQL
			if (error?.code === '23505' || error?.cause?.code === '23505' || error?.message?.includes('unique')) {
				// User was created by another request - update instead
				await db
					.update(users)
					.set({
						email,
						name,
						avatar,
						updatedAt: new Date(),
					})
					.where(eq(users.clerkUserId, clerkUserId))
			} else {
				// Re-throw if it's not a conflict error
				console.error('Error creating user:', error)
				throw error
			}
		}
	}
}

