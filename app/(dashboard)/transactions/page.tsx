import { Suspense } from 'react'
import { getAccounts } from '@/lib/data/accounts'
import { getCategories } from '@/lib/data/categories'
import { getTransactions } from '@/lib/data/transactions'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatDateShort, DEFAULT_CURRENCY } from '@/lib/format'
import { AddTransactionSheet } from '@/components/features/add-transaction-sheet'
import { TransactionActions } from '@/components/features/transaction-actions'
import { TransactionAmount } from '@/components/features/transaction-amount'

async function TransactionsTable({
	accounts,
	categories,
}: {
	accounts: Array<{ id: string; name: string; currency?: string }>
	categories: Array<{ id: string; name: string }>
}) {
	const transactions = await getTransactions()

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
							className="transition-colors duration-150 hover:bg-accent/50 group"
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
								{transaction.accountName}
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
							<TableCell>
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
	)
}

export default async function TransactionsPage() {
	const [accounts, categories] = await Promise.all([
		getAccounts(),
		getCategories(),
	])

	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Transactions</h1>
					<p className="text-muted-foreground">
						View and manage all your transactions
					</p>
				</div>
				<AddTransactionSheet accounts={accounts} categories={categories} />
			</div>

			<Suspense
				fallback={
					<div className="rounded-lg border">
						<div className="p-8 space-y-4">
							{[1, 2, 3, 4, 5].map((i) => (
								<div key={i} className="h-12 bg-muted rounded animate-pulse" />
							))}
						</div>
					</div>
				}
			>
				<TransactionsTable accounts={accounts} categories={categories} />
			</Suspense>
		</div>
	)
}

