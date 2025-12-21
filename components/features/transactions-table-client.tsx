'use client'

import { useState } from 'react'
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
}

export function TransactionsTableClient({ transactions, accounts, categories }: TransactionsTableClientProps) {
	const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null)
	const [detailsOpen, setDetailsOpen] = useState(false)

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
						{transactions.map((transaction) => (
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
						))}
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

