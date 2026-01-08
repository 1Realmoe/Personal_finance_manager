import { NextRequest, NextResponse } from 'next/server'
import { processRecurringTransactions } from '@/lib/actions/recurring-transactions'

/**
 * API route to process recurring transactions
 * This should be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
 * 
 * To secure this endpoint, you can:
 * 1. Add an authorization header check
 * 2. Use Vercel Cron with a secret
 * 3. Use environment variables for authentication
 */
export async function GET(request: NextRequest) {
	try {
		// Optional: Add authentication check
		const authHeader = request.headers.get('authorization')
		const cronSecret = process.env.CRON_SECRET

		if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const result = await processRecurringTransactions()

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
			processed: result.processed,
			created: result.created,
			errors: result.errors,
		})
	} catch (error) {
		console.error('Error in process-recurring route:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
	return GET(request)
}
