'use server'

import { db } from '@/db'
import { goals } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const userId = 'user_1'

export async function createGoal(formData: {
	title: string
	description?: string | null
	targetAmount: string
	currentAmount?: string
	currency: string
	targetDate?: Date | null
	accountId?: string | null
	icon?: string
	color?: string
}) {
	try {
		const [goal] = await db
			.insert(goals)
			.values({
				title: formData.title,
				description: formData.description || null,
				targetAmount: formData.targetAmount,
				currentAmount: formData.currentAmount || '0',
				currency: formData.currency,
				targetDate: formData.targetDate || null,
				accountId: formData.accountId || null,
				icon: formData.icon || 'Target',
				color: formData.color || '#8B5CF6',
				userId,
			})
			.returning()

		revalidatePath('/goals')
		revalidatePath('/')

		return { success: true, goal }
	} catch (error) {
		console.error('Error creating goal:', error)
		return { success: false, error: 'Failed to create goal' }
	}
}

export async function updateGoal(
	goalId: string,
	formData: {
		title: string
		description?: string | null
		targetAmount: string
		currentAmount?: string
		currency: string
		targetDate?: Date | null
		accountId?: string | null
		icon?: string
		color?: string
	}
) {
	try {
		const [goal] = await db
			.update(goals)
			.set({
				title: formData.title,
				description: formData.description || null,
				targetAmount: formData.targetAmount,
				currentAmount: formData.currentAmount || '0',
				currency: formData.currency,
				targetDate: formData.targetDate || null,
				accountId: formData.accountId || null,
				icon: formData.icon || 'Target',
				color: formData.color || '#8B5CF6',
				updatedAt: sql`NOW()`,
			})
			.where(eq(goals.id, goalId))
			.returning()

		if (!goal) {
			return { success: false, error: 'Goal not found' }
		}

		revalidatePath('/goals')
		revalidatePath('/')

		return { success: true, goal }
	} catch (error) {
		console.error('Error updating goal:', error)
		return { success: false, error: 'Failed to update goal' }
	}
}

export async function deleteGoal(goalId: string) {
	try {
		await db.delete(goals).where(eq(goals.id, goalId))

		revalidatePath('/goals')
		revalidatePath('/')

		return { success: true }
	} catch (error) {
		console.error('Error deleting goal:', error)
		return { success: false, error: 'Failed to delete goal' }
	}
}

export async function updateGoalProgress(goalId: string, currentAmount: string) {
	try {
		const [goal] = await db
			.update(goals)
			.set({
				currentAmount,
				updatedAt: sql`NOW()`,
			})
			.where(eq(goals.id, goalId))
			.returning()

		if (!goal) {
			return { success: false, error: 'Goal not found' }
		}

		revalidatePath('/goals')
		revalidatePath('/')

		return { success: true, goal }
	} catch (error) {
		console.error('Error updating goal progress:', error)
		return { success: false, error: 'Failed to update goal progress' }
	}
}

