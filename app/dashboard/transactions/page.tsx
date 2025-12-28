import { Suspense } from 'react'
import { getAccounts } from '@/lib/data/accounts'
import { getCategories } from '@/lib/data/categories'
import { getSources } from '@/lib/data/sources'
import { getTransactions } from '@/lib/data/transactions'
import { AddTransactionSheet } from '@/components/features/add-transaction-sheet'
import { TransactionsTableWrapper } from '@/components/features/transactions-table-wrapper'

async function TransactionsTable({
	accounts,
	categories,
	sources,
}: {
	accounts: Array<{ id: string; name: string; currency?: string }>
	categories: Array<{ id: string; name: string }>
	sources: Array<{ id: string; name: string; icon: string }>
}) {
	const transactions = await getTransactions()

	return (
		<TransactionsTableWrapper
			transactions={transactions}
			accounts={accounts}
			categories={categories}
			sources={sources}
		/>
	)
}

export default async function TransactionsPage() {
	const [accounts, categories, sources] = await Promise.all([
		getAccounts(true), // Exclude investment accounts from regular transactions
		getCategories(),
		getSources(),
	])

	return (
		<div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6 lg:pt-8 space-y-6 sm:space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold mb-2">Transactions</h1>
					<p className="text-muted-foreground">
						View and manage all your transactions
					</p>
				</div>
				<AddTransactionSheet accounts={accounts} categories={categories} sources={sources} />
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
				<TransactionsTable accounts={accounts} categories={categories} sources={sources} />
			</Suspense>
		</div>
	)
}

