import { Suspense } from 'react'
import { getAccounts } from '@/lib/data/accounts'
import { getCategories } from '@/lib/data/categories'
import { getTransactions } from '@/lib/data/transactions'
import { AddTransactionSheet } from '@/components/features/add-transaction-sheet'
import { TransactionsTableWrapper } from '@/components/features/transactions-table-wrapper'

async function TransactionsTable({
	accounts,
	categories,
}: {
	accounts: Array<{ id: string; name: string; currency?: string }>
	categories: Array<{ id: string; name: string }>
}) {
	const transactions = await getTransactions()

	return (
		<TransactionsTableWrapper
			transactions={transactions}
			accounts={accounts}
			categories={categories}
		/>
	)
}

export default async function TransactionsPage() {
	const [accounts, categories] = await Promise.all([
		getAccounts(true), // Exclude investment accounts from regular transactions
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

