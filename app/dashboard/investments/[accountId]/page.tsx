import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getInvestmentAccounts, getHoldings, getInvestmentTransactions, getPortfolioValue } from '@/lib/data/investments'
import { HoldingsTable } from '@/components/features/holdings-table'
import { AddHoldingDialog } from '@/components/features/add-holding-dialog'
import { AddInvestmentTransactionDialog } from '@/components/features/add-investment-transaction-dialog'
import { InvestmentTransactionsTable } from '@/components/features/investment-transactions-table'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getUserBaseCurrency } from '@/lib/actions/user'
import { PortfolioValueDisplay } from '@/components/features/balance-displays'

async function InvestmentAccountDetail({ accountId }: { accountId: string }) {
	const [accounts, holdings, transactions, portfolioValue, baseCurrency] = await Promise.all([
		getInvestmentAccounts(),
		getHoldings(accountId),
		getInvestmentTransactions(accountId),
		getPortfolioValue(accountId),
		getUserBaseCurrency(),
	])

	const account = accounts.find((acc) => acc.id === accountId)

	if (!account) {
		notFound()
	}

	return (
		<div className="space-y-8">
			{/* Account Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-4">
					<Link href="/dashboard/investments">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">{account.name}</h1>
						<p className="text-sm sm:text-base text-muted-foreground capitalize">{account.type.toLowerCase()}</p>
					</div>
				</div>
			</div>

			{/* Portfolio Value */}
			<Card>
				<CardHeader>
					<CardTitle>Portfolio Value</CardTitle>
					<CardDescription>Total value of all holdings in this account (converted to {baseCurrency})</CardDescription>
				</CardHeader>
				<CardContent>
					<PortfolioValueDisplay
						value={portfolioValue}
						currency={baseCurrency}
						className="text-3xl"
					/>
				</CardContent>
			</Card>

			{/* Holdings */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl font-bold">Holdings</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Your current positions. Holdings are automatically created from transactions.
						</p>
					</div>
					<AddHoldingDialog accountId={accountId} />
				</div>
				<HoldingsTable holdings={holdings} accountId={accountId} />
			</div>

			{/* Transaction History */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl font-bold">Transaction History</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Record your buy and sell transactions. This is the recommended way to track investments.
						</p>
					</div>
					<AddInvestmentTransactionDialog
						accountId={accountId}
						holdings={holdings}
					/>
				</div>
				<InvestmentTransactionsTable transactions={transactions} holdings={holdings} />
			</div>
		</div>
	)
}

export default async function InvestmentAccountPage({
	params,
}: {
	params: Promise<{ accountId: string }>
}) {
	const { accountId } = await params

	return (
		<div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6 lg:pt-8">
			<Suspense
				fallback={
					<div className="space-y-8">
						<div className="h-12 bg-muted rounded animate-pulse" />
						<div className="h-64 bg-muted rounded animate-pulse" />
					</div>
				}
			>
				<InvestmentAccountDetail accountId={accountId} />
			</Suspense>
		</div>
	)
}

