import { pgTable, uuid, text, decimal, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'

export const accountTypeEnum = pgEnum('account_type', ['CURRENT', 'SAVINGS', 'CASH', 'INVESTMENT'])
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE', 'TRANSFER'])
export const recurrenceFrequencyEnum = pgEnum('recurrence_frequency', ['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'])
export const assetTypeEnum = pgEnum('asset_type', ['STOCK', 'CRYPTO'])
export const investmentTransactionTypeEnum = pgEnum('investment_transaction_type', ['BUY', 'SELL'])

export const accounts = pgTable('accounts', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	type: accountTypeEnum('type').notNull(),
	balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
	color: text('color').notNull(),
	currency: text('currency').notNull().default('USD'), // Primary/default currency - matches DEFAULT_CURRENCY in lib/currency.ts
	cardImage: text('card_image'), // Optional card background image
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
})

export const accountCurrencies = pgTable('account_currencies', {
	id: uuid('id').defaultRandom().primaryKey(),
	accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	currency: text('currency').notNull(),
	balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
})

export const categories = pgTable('categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
})

export const sources = pgTable('sources', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
})

export const transactions = pgTable('transactions', {
	id: uuid('id').defaultRandom().primaryKey(),
	amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
	description: text('description').notNull(),
	date: timestamp('date').notNull().defaultNow(),
	accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	toAccountId: uuid('to_account_id').references(() => accounts.id, { onDelete: 'set null' }), // Destination account for transfers
	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	type: transactionTypeEnum('type').notNull(),
	currency: text('currency').notNull().default('USD'), // Matches DEFAULT_CURRENCY in lib/currency.ts
	sourceId: uuid('source_id').references(() => sources.id, { onDelete: 'set null' }), // Optional source of income (e.g., YouTube, Affiliate, etc.)
	isRecurrent: boolean('is_recurrent').notNull().default(false), // Whether this is a recurring transaction
	recurrenceFrequency: recurrenceFrequencyEnum('recurrence_frequency'), // Frequency of recurrence (MONTHLY, YEARLY, WEEKLY, DAILY)
	parentRecurringTransactionId: uuid('parent_recurring_transaction_id'), // Reference to the original recurring transaction template (self-reference, FK defined in migration)
	receiptImage: text('receipt_image'), // Optional receipt image stored as base64 data URL
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
})

export const goals = pgTable('goals', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	targetAmount: decimal('target_amount', { precision: 19, scale: 4 }).notNull(),
	currentAmount: decimal('current_amount', { precision: 19, scale: 4 }).notNull().default('0'),
	currency: text('currency').notNull().default('USD'), // Matches DEFAULT_CURRENCY in lib/currency.ts
	targetDate: timestamp('target_date'),
	accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
	icon: text('icon').notNull().default('Target'),
	color: text('color').notNull().default('#8B5CF6'), // Default purple color
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	clerkUserId: text('clerk_user_id').notNull().unique(), // Clerk's user ID (primary identifier)
	email: text('email').notNull().unique(), // Synced from Clerk
	name: text('name'), // Synced from Clerk, optional
	avatar: text('avatar'), // Synced from Clerk, optional
	baseCurrency: text('base_currency').notNull().default('USD'), // Custom app preference
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const holdings = pgTable('holdings', {
	id: uuid('id').defaultRandom().primaryKey(),
	accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	symbol: text('symbol').notNull(), // e.g., "AAPL", "BTC"
	assetType: assetTypeEnum('asset_type').notNull(), // STOCK or CRYPTO
	quantity: decimal('quantity', { precision: 19, scale: 8 }).notNull().default('0'),
	averagePurchasePrice: decimal('average_purchase_price', { precision: 19, scale: 4 }).notNull().default('0'),
	currentPrice: decimal('current_price', { precision: 19, scale: 4 }).notNull().default('0'),
	currency: text('currency').notNull().default('USD'),
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const investmentTransactions = pgTable('investment_transactions', {
	id: uuid('id').defaultRandom().primaryKey(),
	accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	holdingId: uuid('holding_id').references(() => holdings.id, { onDelete: 'set null' }),
	type: investmentTransactionTypeEnum('type').notNull(), // BUY or SELL
	symbol: text('symbol').notNull(),
	quantity: decimal('quantity', { precision: 19, scale: 8 }).notNull(),
	price: decimal('price', { precision: 19, scale: 4 }).notNull(),
	date: timestamp('date').notNull().defaultNow(),
	currency: text('currency').notNull().default('USD'),
	clerkUserId: text('clerk_user_id').notNull(), // Clerk user ID
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

