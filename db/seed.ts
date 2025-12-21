import 'dotenv/config'
import { db } from './index'
import { accounts, categories } from './schema'

const userId = 'user_1'

async function seed() {
	console.log('Seeding database...')

	// Seed Categories
	const defaultCategories = [
		{ name: 'Housing', type: 'EXPENSE' as const, icon: 'Home' },
		{ name: 'Food', type: 'EXPENSE' as const, icon: 'Utensils' },
		{ name: 'Salary', type: 'INCOME' as const, icon: 'DollarSign' },
	]

	const insertedCategories = await db
		.insert(categories)
		.values(defaultCategories.map((cat) => ({ ...cat, userId })))
		.returning()

	console.log(`Inserted ${insertedCategories.length} categories`)

	// Seed one dummy account
	const dummyAccount = await db
		.insert(accounts)
		.values({
			name: 'Chase Checking',
			type: 'CURRENT',
			balance: '1000.00',
			color: '#3B82F6',
			currency: 'USD',
			userId,
		})
		.returning()

	console.log(`Inserted account: ${dummyAccount[0]?.name}`)
	console.log('Seeding completed!')
}

seed()
	.catch((error) => {
		console.error('Error seeding database:', error)
		process.exit(1)
	})
	.finally(() => {
		process.exit(0)
	})

