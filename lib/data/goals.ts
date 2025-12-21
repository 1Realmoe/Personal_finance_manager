import { db } from '@/db'
import { goals, accounts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function getGoals() {
	const clerkUserId = await getCurrentUserId()
	const results = await db
		.select({
			id: goals.id,
			title: goals.title,
			description: goals.description,
			targetAmount: goals.targetAmount,
			currentAmount: goals.currentAmount,
			currency: goals.currency,
			targetDate: goals.targetDate,
			accountId: goals.accountId,
			accountName: accounts.name,
			icon: goals.icon,
			color: goals.color,
			createdAt: goals.createdAt,
			updatedAt: goals.updatedAt,
		})
		.from(goals)
		.leftJoin(accounts, and(
			eq(goals.accountId, accounts.id),
			eq(accounts.clerkUserId, clerkUserId)
		))
		.where(eq(goals.clerkUserId, clerkUserId))

	return results
}

export async function getGoalById(goalId: string) {
	const clerkUserId = await getCurrentUserId()
	const [result] = await db
		.select({
			id: goals.id,
			title: goals.title,
			description: goals.description,
			targetAmount: goals.targetAmount,
			currentAmount: goals.currentAmount,
			currency: goals.currency,
			targetDate: goals.targetDate,
			accountId: goals.accountId,
			accountName: accounts.name,
			icon: goals.icon,
			color: goals.color,
			createdAt: goals.createdAt,
			updatedAt: goals.updatedAt,
		})
		.from(goals)
		.leftJoin(accounts, and(
			eq(goals.accountId, accounts.id),
			eq(accounts.clerkUserId, clerkUserId)
		))
		.where(
			and(
				eq(goals.id, goalId),
				eq(goals.clerkUserId, clerkUserId)
			)
		)

	return result
}

