import { db } from '@/db'
import { sources } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function getSources() {
	const clerkUserId = await getCurrentUserId()
	const results = await db
		.select()
		.from(sources)
		.where(eq(sources.clerkUserId, clerkUserId))
		.orderBy(sources.name)

	return results
}

