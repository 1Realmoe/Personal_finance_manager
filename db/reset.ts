import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set')
}

const sql = neon(process.env.DATABASE_URL)

async function resetDatabase() {

	try {
		// Drop all tables in the correct order (respecting foreign keys)
		await sql`
			DROP TABLE IF EXISTS transactions CASCADE;
		`
	

		await sql`
			DROP TABLE IF EXISTS accounts CASCADE;
		`
	

		await sql`
			DROP TABLE IF EXISTS categories CASCADE;
		`
	

		// Drop enums
		await sql`
			DROP TYPE IF EXISTS transaction_type CASCADE;
		`
	

		await sql`
			DROP TYPE IF EXISTS category_type CASCADE;
		`
	

		await sql`
			DROP TYPE IF EXISTS account_type CASCADE;
		`
	} catch (error) {
		console.error('Error resetting database:', error)
		process.exit(1)
	}
}

resetDatabase()
	.then(() => {
		process.exit(0)
	})
	.catch((error) => {
		console.error('Error:', error)
		process.exit(1)
	})

