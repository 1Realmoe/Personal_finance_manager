import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTotalBalance } from '@/lib/data/accounts'
import { getRecentTransactions } from '@/lib/data/transactions'
import {
	getMonthlyIncome,
	getMonthlyExpense,
} from '@/lib/data/dashboard'
import { format } from 'date-fns'
import { MonthlyExpensesChart } from '@/components/features/monthly-expenses-chart'
import { getDailyExpensesForMonth } from '@/lib/data/dashboard'
import { MonthPicker } from '@/components/ui/month-picker'
import { DashboardBalance } from '@/components/features/dashboard-balance'
import { TransactionAmount } from '@/components/features/transaction-amount'

interface DashboardPageProps {
	searchParams: Promise<{ month?: string }>
}

function parseMonthFromSearchParams(monthParam: string | undefined) {
	if (monthParam) {
		const [year, month] = monthParam.split('-').map(Number)
		if (year && month >= 1 && month <= 12) {
			return { year, month }
		}
	}
	const now = new Date()
	return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

async function SummaryCards({ year, month }: { year: number; month: number }) {
	const [totalBalance, monthlyIncome, monthlyExpense] = await Promise.all([
		getTotalBalance(),
		getMonthlyIncome(year, month),
		getMonthlyExpense(year, month),
	])

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Balance</CardTitle>
					<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-4 w-4 text-primary"
						>
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					</div>
				</CardHeader>
				<CardContent>
					<DashboardBalance amount={totalBalance} currency="USD" />
				</CardContent>
			</Card>
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
					<div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-4 w-4 text-green-600"
						>
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					</div>
				</CardHeader>
				<CardContent>
					<DashboardBalance 
						amount={monthlyIncome.toString()} 
						currency="USD" 
						className="text-green-600 dark:text-green-400"
					/>
				</CardContent>
			</Card>
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Monthly Expense</CardTitle>
					<div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-4 w-4 text-red-600"
						>
							<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
						</svg>
					</div>
				</CardHeader>
				<CardContent>
					<DashboardBalance 
						amount={monthlyExpense.toString()} 
						currency="USD" 
						className="text-red-600 dark:text-red-400"
					/>
				</CardContent>
			</Card>
		</div>
	)
}

async function RecentTransactionsList() {
	const transactions = await getRecentTransactions(5)

	if (transactions.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Recent Transactions</CardTitle>
				</CardHeader>
				<CardContent className="py-12 text-center">
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
					<p className="text-sm text-muted-foreground">
						Create your first transaction to get started!
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Transactions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{transactions.map((transaction) => (
						<div
							key={transaction.id}
							className="flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-accent/50 border-b last:border-0"
						>
							<div className="space-y-1 flex-1">
								<p className="text-sm font-medium leading-none">
									{transaction.description}
								</p>
								<p className="text-xs text-muted-foreground">
									{transaction.accountName} •{' '}
									{format(new Date(transaction.date), 'MMM d, yyyy')}
									{transaction.categoryName && ` • ${transaction.categoryName}`}
								</p>
							</div>
							<TransactionAmount
								amount={transaction.amount || '0'}
								currency={transaction.currency || 'USD'}
								type={transaction.type}
								className="text-sm"
							/>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
	const resolvedSearchParams = await searchParams
	const { year, month } = parseMonthFromSearchParams(resolvedSearchParams.month)

	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Overview of your finances
					</p>
				</div>
				<Suspense fallback={<div className="h-9 w-[240px] bg-muted rounded animate-pulse" />}>
					<MonthPicker />
				</Suspense>
			</div>

			<Suspense
				fallback={
					<div className="grid gap-4 md:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader className="space-y-0 pb-2">
									<div className="h-4 w-24 bg-muted rounded" />
								</CardHeader>
								<CardContent>
									<div className="h-8 w-32 bg-muted rounded" />
								</CardContent>
							</Card>
						))}
					</div>
				}
			>
				<SummaryCards year={year} month={month} />
			</Suspense>

			<Suspense
				fallback={
					<Card>
						<CardHeader>
							<div className="h-6 w-40 bg-muted rounded animate-pulse" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-16 bg-muted rounded animate-pulse" />
								))}
							</div>
						</CardContent>
					</Card>
				}
			>
				<RecentTransactionsList />
			</Suspense>

			<Suspense
				fallback={
					<Card>
						<CardHeader>
							<div className="h-6 w-40 bg-muted rounded animate-pulse" />
						</CardHeader>
						<CardContent>
							<div className="h-[300px] bg-muted rounded animate-pulse" />
						</CardContent>
					</Card>
				}
			>
				<MonthlyExpensesChartWrapper year={year} month={month} />
			</Suspense>
		</div>
	)
}

async function MonthlyExpensesChartWrapper({
	year,
	month,
}: {
	year: number
	month: number
}) {
	const dailyExpenses = await getDailyExpensesForMonth(year, month)

	return <MonthlyExpensesChart data={dailyExpenses} />
}
