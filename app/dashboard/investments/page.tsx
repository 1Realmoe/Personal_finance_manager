import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getInvestmentAccounts, getHoldings, getInvestmentTransactions, getPortfolioPerformance, getPortfolioValue } from '@/lib/data/investments'
import { PortfolioSummary } from '@/components/features/portfolio-summary'
import { HoldingsTable } from '@/components/features/holdings-table'
import { AddHoldingDialog } from '@/components/features/add-holding-dialog'
import { AddInvestmentTransactionDialog } from '@/components/features/add-investment-transaction-dialog'
import { InvestmentTransactionsTable } from '@/components/features/investment-transactions-table'
import { AccountActions } from '@/components/features/account-actions'
import { InvestmentAccountCard } from '@/components/features/investment-account-card'
import { TrendingUp } from 'lucide-react'

async function InvestmentsContent() {
	const [accounts, allHoldings, transactions, performance] = await Promise.all([
		getInvestmentAccounts(),
		getHoldings(),
		getInvestmentTransactions(),
		getPortfolioPerformance(),
	])

	// Calculate portfolio values for all accounts efficiently (optimized to avoid N+1 queries)
	const { getPortfolioValuesForAccounts } = await import('@/lib/data/investments')
	const portfolioValuesMap = await getPortfolioValuesForAccounts(accounts.map(a => a.id))
	
	const accountsWithPortfolioValue = accounts.map((account) => ({
		...account,
		portfolioValue: portfolioValuesMap.get(account.id) || 0,
	}))

	return (
		<div className="space-y-8">
			{/* Portfolio Summary */}
			<PortfolioSummary
				totalValue={performance.totalValue}
				totalCost={performance.totalCost}
				gainLoss={performance.gainLoss}
				gainLossPercent={performance.gainLossPercent}
				baseCurrency={performance.baseCurrency}
				holdingsCount={allHoldings.length}
			/>

			{/* Investment Accounts */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-2xl font-bold">Investment Accounts</h2>
					<AccountActions defaultAccountType="INVESTMENT" />
				</div>
				{accounts.length === 0 ? (
					<Card className="border-dashed">
						<CardContent className="py-12 text-center">
							<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
								<TrendingUp className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="text-lg font-semibold mb-2">No investment accounts yet</h3>
							<p className="text-sm text-muted-foreground mb-4">
								Create your first investment account to start tracking your portfolio
							</p>
							<AccountActions defaultAccountType="INVESTMENT" />
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{accountsWithPortfolioValue.map((account) => (
							<InvestmentAccountCard key={account.id} account={account} portfolioValue={account.portfolioValue} />
						))}
					</div>
				)}
			</div>

			{/* All Holdings Overview */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl font-bold">All Holdings</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Your current positions across all accounts. Holdings are automatically created from transactions.
						</p>
					</div>
					{accounts.length > 0 && <AddHoldingDialog accounts={accounts} />}
				</div>
				<HoldingsTable holdings={allHoldings} />
			</div>

			{/* Recent Investment Transactions */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-2xl font-bold">Recent Transactions</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Record your buy and sell transactions. This is the recommended way to track investments.
						</p>
					</div>
					{accounts.length > 0 && (
						<AddInvestmentTransactionDialog
							accounts={accounts}
							holdings={allHoldings}
						/>
					)}
				</div>
				<InvestmentTransactionsTable
					transactions={transactions.slice(0, 10)}
					holdings={allHoldings}
				/>
			</div>
		</div>
	)
}

export default async function InvestmentsPage() {
	return (
		<div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6 lg:pt-8 space-y-6 sm:space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold mb-2">Investments</h1>
					<p className="text-muted-foreground">
						Track your investment portfolio and performance
					</p>
				</div>
			</div>

			<Suspense
				fallback={
					<div className="space-y-8">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{[1, 2, 3, 4].map((i) => (
								<Card key={i} className="animate-pulse">
									<CardHeader>
										<div className="h-4 w-24 bg-muted rounded" />
									</CardHeader>
									<CardContent>
										<div className="h-8 w-32 bg-muted rounded" />
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				}
			>
				<InvestmentsContent />
			</Suspense>
		</div>
	)
}

