import { db } from '@/db'
import { goals, accounts } from '@/db/schema'
import { eq } from 'drizzle-orm'

const userId = 'user_1'

export async function getGoals() {
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
			createdAt: goals.createdAt,
			updatedAt: goals.updatedAt,
		})
		.from(goals)
		.leftJoin(accounts, eq(goals.accountId, accounts.id))
		.where(eq(goals.userId, userId))

	return results
}

export async function getGoalById(goalId: string) {
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
			createdAt: goals.createdAt,
			updatedAt: goals.updatedAt,
		})
		.from(goals)
		.leftJoin(accounts, eq(goals.accountId, accounts.id))
		.where(eq(goals.id, goalId))

	return result
}

