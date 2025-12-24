'use server'

import { db } from '@/db'
import { sources, transactions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function createSource(formData: {
	name: string
	icon: string
}) {
	try {
		const clerkUserId = await getCurrentUserId()
		const [source] = await db
			.insert(sources)
			.values({
				name: formData.name,
				icon: formData.icon,
				clerkUserId,
			})
			.returning()

		revalidatePath('/dashboard/sources')
		revalidatePath('/dashboard/transactions')

		return { success: true, source }
	} catch (error) {
		console.error('Error creating source:', error)
		return { success: false, error: 'Failed to create source' }
	}
}

export async function updateSource(
	sourceId: string,
	formData: {
		name: string
		icon: string
	}
) {
	try {
		const clerkUserId = await getCurrentUserId()
		const [source] = await db
			.update(sources)
			.set({
				name: formData.name,
				icon: formData.icon,
			})
			.where(
				and(
					eq(sources.id, sourceId),
					eq(sources.clerkUserId, clerkUserId)
				)
			)
			.returning()

		if (!source) {
			return { success: false, error: 'Source not found' }
		}

		revalidatePath('/dashboard/sources')
		revalidatePath('/dashboard/transactions')

		return { success: true, source }
	} catch (error) {
		console.error('Error updating source:', error)
		return { success: false, error: 'Failed to update source' }
	}
}

export async function deleteSource(sourceId: string) {
	try {
		const clerkUserId = await getCurrentUserId()
		
		// Verify source belongs to user
		const [source] = await db
			.select()
			.from(sources)
			.where(
				and(
					eq(sources.id, sourceId),
					eq(sources.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!source) {
			return { success: false, error: 'Source not found' }
		}

		// Check if source has transactions
		const sourceTransactions = await db
			.select()
			.from(transactions)
			.where(eq(transactions.sourceId, sourceId))
			.limit(1)

		if (sourceTransactions.length > 0) {
			return {
				success: false,
				error: 'Cannot delete source with existing transactions',
			}
		}

		await db
			.delete(sources)
			.where(
				and(
					eq(sources.id, sourceId),
					eq(sources.clerkUserId, clerkUserId)
				)
			)

		revalidatePath('/dashboard/sources')
		revalidatePath('/dashboard/transactions')

		return { success: true }
	} catch (error) {
		console.error('Error deleting source:', error)
		return { success: false, error: 'Failed to delete source' }
	}
}

