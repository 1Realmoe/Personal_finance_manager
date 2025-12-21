import { pgTable, uuid, text, decimal, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'

export const accountTypeEnum = pgEnum('account_type', ['CURRENT', 'SAVINGS', 'CASH'])
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE'])

export const accounts = pgTable('accounts', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	type: accountTypeEnum('type').notNull(),
	balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
	color: text('color').notNull(),
	currency: text('currency').notNull().default('USD'), // Primary/default currency for backward compatibility
	cardImage: text('card_image'), // Optional card background image
	userId: text('user_id').notNull().default('user_1'), // Hardcoded for now
})

export const accountCurrencies = pgTable('account_currencies', {
	id: uuid('id').defaultRandom().primaryKey(),
	accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	currency: text('currency').notNull(),
	balance: decimal('balance', { precision: 19, scale: 4 }).notNull().default('0'),
	userId: text('user_id').notNull().default('user_1'), // Hardcoded for now
})

export const categories = pgTable('categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	icon: text('icon').notNull(),
	userId: text('user_id').notNull().default('user_1'), // Hardcoded for now
})

export const transactions = pgTable('transactions', {
	id: uuid('id').defaultRandom().primaryKey(),
	amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
	description: text('description').notNull(),
	date: timestamp('date').notNull().defaultNow(),
	accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	type: transactionTypeEnum('type').notNull(),
	currency: text('currency').notNull().default('USD'),
	source: text('source'), // Optional source of income (e.g., YouTube, Affiliate, etc.)
	isRecurrent: boolean('is_recurrent').notNull().default(false), // Whether this is a recurring transaction
	userId: text('user_id').notNull().default('user_1'), // Hardcoded for now
})

export const goals = pgTable('goals', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	targetAmount: decimal('target_amount', { precision: 19, scale: 4 }).notNull(),
	currentAmount: decimal('current_amount', { precision: 19, scale: 4 }).notNull().default('0'),
	currency: text('currency').notNull().default('USD'),
	targetDate: timestamp('target_date'),
	accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
	userId: text('user_id').notNull().default('user_1'), // Hardcoded for now
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

