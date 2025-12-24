'use client'

import { useState } from 'react'
import { TransactionsTableClient } from '@/components/features/transactions-table-client'
import { TransactionsSearchFilters, TransactionFilters } from '@/components/features/transactions-search-filters'

interface TransactionsTableWrapperProps {
	transactions: Array<{
		id: string
		amount: string
		description: string
		date: Date | string
		accountName: string | null
		categoryName?: string | null
		type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
		accountId: string
		toAccountId?: string | null
		categoryId?: string | null
		currency?: string
		sourceId?: string | null
		sourceName?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
	}>
	accounts: Array<{ id: string; name: string; currency?: string }>
	categories: Array<{ id: string; name: string }>
	sources?: Array<{ id: string; name: string; icon: string }>
}

export function TransactionsTableWrapper({
	transactions,
	accounts,
	categories,
	sources = [],
}: TransactionsTableWrapperProps) {
	const [filters, setFilters] = useState<TransactionFilters>({
		searchQuery: '',
		dateFrom: null,
		dateTo: null,
		accountIds: [],
		categoryIds: [],
		type: 'ALL',
		amountMin: '',
		amountMax: '',
	})

	return (
		<div className="space-y-4">
			<TransactionsSearchFilters
				accounts={accounts}
				categories={categories}
				onFiltersChange={setFilters}
			/>
			<TransactionsTableClient
				transactions={transactions}
				accounts={accounts}
				categories={categories}
				sources={sources}
				filters={filters}
			/>
		</div>
	)
}

