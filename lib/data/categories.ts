import { db } from '@/db'
import { categories } from '@/db/schema'
import { eq } from 'drizzle-orm'

const userId = 'user_1'

export async function getCategories() {
	const results = await db
		.select()
		.from(categories)
		.where(eq(categories.userId, userId))

	return results
}

export async function getCategoriesByType(type: 'INCOME' | 'EXPENSE') {
	const results = await db
		.select()
		.from(categories)
		.where(eq(categories.userId, userId))

	return results.filter((cat) => cat.type === type)
}

