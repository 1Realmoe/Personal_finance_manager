'use server'

import { db } from '@/db'
import {
	users,
	transactions,
	accounts,
	accountCurrencies,
	categories,
	sources,
	goals,
	holdings,
	investmentTransactions,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'
import { clerkClient } from '@clerk/nextjs/server'

/**
 * Delete user account and all associated data.
 *
 * Because neon-http does not support interactive transactions,
 * we delete records sequentially in dependency order:
 *   1. Child tables that reference other user tables (transactions, accountCurrencies, investmentTransactions)
 *   2. Mid-level tables (holdings, accounts, categories, sources, goals)
 *   3. The user row itself
 */
export async function deleteAccount(): Promise<void> {
	const clerkUserId = await getCurrentUserId()

	// --- 1. Delete leaf / child records first ---

	// Transactions reference accounts, categories, and sources
	await db.delete(transactions).where(eq(transactions.clerkUserId, clerkUserId))

	// Investment transactions reference accounts and holdings
	await db.delete(investmentTransactions).where(eq(investmentTransactions.clerkUserId, clerkUserId))

	// Account currencies cascade from accounts, but delete explicitly to be safe
	await db.delete(accountCurrencies).where(eq(accountCurrencies.clerkUserId, clerkUserId))

	// --- 2. Delete mid-level tables ---

	// Holdings reference accounts
	await db.delete(holdings).where(eq(holdings.clerkUserId, clerkUserId))

	// Accounts (accountCurrencies already deleted above)
	await db.delete(accounts).where(eq(accounts.clerkUserId, clerkUserId))

	// Categories, sources, goals are independent of each other
	await db.delete(categories).where(eq(categories.clerkUserId, clerkUserId))
	await db.delete(sources).where(eq(sources.clerkUserId, clerkUserId))
	await db.delete(goals).where(eq(goals.clerkUserId, clerkUserId))

	// --- 3. Delete the user row ---
	await db.delete(users).where(eq(users.clerkUserId, clerkUserId))

	// --- 4. Delete user from Clerk ---
	const clerk = await clerkClient()
	await clerk.users.deleteUser(clerkUserId)

	revalidatePath('/dashboard')
}

