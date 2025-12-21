import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set')
}

const sql = neon(process.env.DATABASE_URL)

async function resetDatabase() {
	console.log('Resetting database...')

	try {
		// Drop all tables in the correct order (respecting foreign keys)
		await sql`
			DROP TABLE IF EXISTS transactions CASCADE;
		`
		console.log('✓ Dropped transactions table')

		await sql`
			DROP TABLE IF EXISTS accounts CASCADE;
		`
		console.log('✓ Dropped accounts table')

		await sql`
			DROP TABLE IF EXISTS categories CASCADE;
		`
		console.log('✓ Dropped categories table')

		// Drop enums
		await sql`
			DROP TYPE IF EXISTS transaction_type CASCADE;
		`
		console.log('✓ Dropped transaction_type enum')

		await sql`
			DROP TYPE IF EXISTS category_type CASCADE;
		`
		console.log('✓ Dropped category_type enum')

		await sql`
			DROP TYPE IF EXISTS account_type CASCADE;
		`
		console.log('✓ Dropped account_type enum')

		console.log('\n✅ Database reset complete!')
		console.log('Run "npm run db:push" to recreate the schema.')
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

