import { db } from '@/db'
import { categories } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function getCategories() {
	const clerkUserId = await getCurrentUserId()
	const results = await db
		.select()
		.from(categories)
		.where(eq(categories.clerkUserId, clerkUserId))

	return results
}

