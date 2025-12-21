'use client'

import { useState, useMemo } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatDateShort, DEFAULT_CURRENCY } from '@/lib/format'
import { TransactionActions } from '@/components/features/transaction-actions'
import { TransactionAmount } from '@/components/features/transaction-amount'
import { TransactionDetails } from '@/components/features/transaction-details'
import { TransactionFilters } from '@/components/features/transactions-search-filters'

interface TransactionsTableClientProps {
	transactions: Array<{
		id: string
		amount: string
		description: string
		date: Date | string
		accountName: string | null
		categoryName?: string | null
		type: 'INCOME' | 'EXPENSE'
		accountId: string
		categoryId?: string | null
		currency?: string
		source?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
	}>
	accounts: Array<{ id: string; name: string; currency?: string }>
	categories: Array<{ id: string; name: string }>
	filters: TransactionFilters
}

export function TransactionsTableClient({ transactions, accounts, categories, filters }: TransactionsTableClientProps) {
	const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)

	// Filter transactions based on filters
	const filteredTransactions = useMemo(() => {
		return transactions.filter((transaction) => {
			// Search query filter
			if (filters.searchQuery) {
				const query = filters.searchQuery.toLowerCase()
				const matchesDescription = transaction.description.toLowerCase().includes(query)
				const matchesCategory = transaction.categoryName?.toLowerCase().includes(query) || false
				const matchesAccount = transaction.accountName?.toLowerCase().includes(query) || false
				
				if (!matchesDescription && !matchesCategory && !matchesAccount) {
					return false
				}
			}

			// Date range filter
			if (filters.dateFrom) {
				const transactionDate = new Date(transaction.date)
				if (transactionDate < filters.dateFrom) {
					return false
				}
			}
			if (filters.dateTo) {
				const transactionDate = new Date(transaction.date)
				const endDate = new Date(filters.dateTo)
				endDate.setHours(23, 59, 59, 999)
				if (transactionDate > endDate) {
					return false
				}
			}

			// Account filter
			if (filters.accountIds.length > 0 && !filters.accountIds.includes(transaction.accountId)) {
				return false
			}

			// Category filter
			if (filters.categoryIds.length > 0) {
				if (!transaction.categoryId || !filters.categoryIds.includes(transaction.categoryId)) {
					return false
				}
			}

			// Type filter
			if (filters.type !== 'ALL' && transaction.type !== filters.type) {
				return false
			}

			// Amount range filter
			const amount = parseFloat(transaction.amount || '0')
			if (filters.amountMin && amount < parseFloat(filters.amountMin)) {
				return false
			}
			if (filters.amountMax && amount > parseFloat(filters.amountMax)) {
				return false
			}

			return true
		})
	}, [transactions, filters])

	const handleRowClick = (transaction: typeof transactions[0]) => {
		setSelectedTransaction(transaction)
		setDetailsOpen(true)
	}

	if (transactions.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-12 text-center">
				<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="h-6 w-6 text-muted-foreground"
					>
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
				<p className="text-muted-foreground mb-4">
					Create your first transaction to get started!
				</p>
			</div>
		)
	}

	return (
		<>
			<div className="rounded-lg border overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead>Date</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Account</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Source</TableHead>
							<TableHead className="text-right">Amount</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTransactions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className="text-center py-12">
									<div className="flex flex-col items-center justify-center">
										<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="h-6 w-6 text-muted-foreground"
											>
												<circle cx="11" cy="11" r="8" />
												<path d="m21 21-4.35-4.35" />
											</svg>
										</div>
										<h3 className="text-lg font-semibold mb-2">No transactions found</h3>
										<p className="text-sm text-muted-foreground">
											Try adjusting your filters to see more results
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							filteredTransactions.map((transaction) => (
							<TableRow
								key={transaction.id}
								onClick={() => handleRowClick(transaction)}
								className="transition-colors duration-150 hover:bg-accent/50 group cursor-pointer"
							>
								<TableCell className="text-muted-foreground">
									{formatDateShort(transaction.date)}
								</TableCell>
								<TableCell className="font-medium">
									{transaction.description}
								</TableCell>
								<TableCell>
									{transaction.categoryName || (
										<span className="text-muted-foreground">—</span>
									)}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{transaction.accountName || '—'}
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
											transaction.type === 'INCOME'
												? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
												: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
										}`}
									>
										{transaction.type}
									</span>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{transaction.source || <span className="text-muted-foreground">—</span>}
								</TableCell>
								<TableCell className="text-right">
									<TransactionAmount
										amount={transaction.amount || '0'}
										currency={transaction.currency || DEFAULT_CURRENCY}
										type={transaction.type}
									/>
								</TableCell>
								<TableCell onClick={(e) => e.stopPropagation()}>
									<div className="opacity-0 group-hover:opacity-100 transition-opacity">
										<TransactionActions 
											transactionId={transaction.id}
											transaction={{
												id: transaction.id,
												amount: transaction.amount || '0',
												description: transaction.description,
												date: transaction.date,
												accountId: transaction.accountId,
												categoryId: transaction.categoryId,
												type: transaction.type,
												currency: transaction.currency,
												source: transaction.source || null,
												isRecurrent: transaction.isRecurrent || false,
												recurrenceFrequency: transaction.recurrenceFrequency || null,
											}}
											accounts={accounts}
											categories={categories}
										/>
									</div>
								</TableCell>
							</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{selectedTransaction && (
				<TransactionDetails
					transaction={{
						...selectedTransaction,
						accountName: selectedTransaction.accountName || null,
					}}
					open={detailsOpen}
					onOpenChange={setDetailsOpen}
				/>
			)}
		</>
	)
}

