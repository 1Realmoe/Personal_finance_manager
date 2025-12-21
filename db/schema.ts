import { pgTable, uuid, text, decimal, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const accountTypeEnum = pgEnum('account_type', ['CURRENT', 'SAVINGS', 'CASH'])
export const categoryTypeEnum = pgEnum('category_type', ['INCOME', 'EXPENSE'])
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
	type: categoryTypeEnum('type').notNull(),
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
	userId: text('user_id').notNull().default('user_1'), // Hardcoded for now
})

