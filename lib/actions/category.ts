'use server'

import { db } from '@/db'
import { categories, transactions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function createCategory(formData: {
	name: string
	icon: string
}) {
	try {
		const clerkUserId = await getCurrentUserId()
		const [category] = await db
			.insert(categories)
			.values({
				name: formData.name,
				icon: formData.icon,
				clerkUserId,
			})
			.returning()

		revalidatePath('/categories')
		revalidatePath('/transactions')

		return { success: true, category }
	} catch (error) {
		console.error('Error creating category:', error)
		return { success: false, error: 'Failed to create category' }
	}
}

export async function updateCategory(
	categoryId: string,
	formData: {
		name: string
		icon: string
	}
) {
	try {
		const clerkUserId = await getCurrentUserId()
		const [category] = await db
			.update(categories)
			.set({
				name: formData.name,
				icon: formData.icon,
			})
			.where(
				and(
					eq(categories.id, categoryId),
					eq(categories.clerkUserId, clerkUserId)
				)
			)
			.returning()

		if (!category) {
			return { success: false, error: 'Category not found' }
		}

		revalidatePath('/categories')
		revalidatePath('/transactions')

		return { success: true, category }
	} catch (error) {
		console.error('Error updating category:', error)
		return { success: false, error: 'Failed to update category' }
	}
}

export async function deleteCategory(categoryId: string) {
	try {
		const clerkUserId = await getCurrentUserId()
		
		// Verify category belongs to user
		const [category] = await db
			.select()
			.from(categories)
			.where(
				and(
					eq(categories.id, categoryId),
					eq(categories.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!category) {
			return { success: false, error: 'Category not found' }
		}

		// Check if category has transactions
		const categoryTransactions = await db
			.select()
			.from(transactions)
			.where(eq(transactions.categoryId, categoryId))
			.limit(1)

		if (categoryTransactions.length > 0) {
			return {
				success: false,
				error: 'Cannot delete category with existing transactions',
			}
		}

		await db
			.delete(categories)
			.where(
				and(
					eq(categories.id, categoryId),
					eq(categories.clerkUserId, clerkUserId)
				)
			)

		revalidatePath('/categories')
		revalidatePath('/transactions')

		return { success: true }
	} catch (error) {
		console.error('Error deleting category:', error)
		return { success: false, error: 'Failed to delete category' }
	}
}

