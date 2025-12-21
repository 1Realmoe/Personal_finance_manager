import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTotalBalance } from '@/lib/data/accounts'
import { getRecentTransactions } from '@/lib/data/transactions'
import {
	getMonthlyIncome,
	getMonthlyExpense,
	getFrequentExpenses,
	getSingleExpenses,
	getTopExpensesByCategory,
	getOverviewStats,
	getIncomeVsExpense,
	getDailyExpensesForMonth,
	getYearlyIncome,
	getYearlyExpense,
	getMonthlyExpensesForYear,
	getYearlyIncomeVsExpense,
	getYearlyTopExpensesByCategory,
	getYearlyFrequentExpenses,
	getYearlySingleExpenses,
} from '@/lib/data/dashboard'
import { MonthlyExpensesChart } from '@/components/features/monthly-expenses-chart'
import { YearlyExpensesChart } from '@/components/features/yearly-expenses-chart'
import { CategoryBreakdownChart } from '@/components/features/category-breakdown-chart'
import { IncomeExpenseChart } from '@/components/features/income-expense-chart'
import { PeriodPicker } from '@/components/ui/period-picker'
import { DashboardBalance } from '@/components/features/dashboard-balance'
import { TransactionAmount } from '@/components/features/transaction-amount'
import { Wallet, Tag, Target, Receipt, TrendingUp, TrendingDown, Repeat, Zap } from 'lucide-react'
import { formatCurrency, formatDateShort, formatDateCompact, DEFAULT_CURRENCY } from '@/lib/format'

interface DashboardPageProps {
	searchParams: Promise<{ month?: string; year?: string; view?: string }>
}

function parsePeriodFromSearchParams(
	monthParam: string | undefined,
	yearParam: string | undefined,
	viewParam: string | undefined
) {
	const view = (viewParam as 'month' | 'year') || 'month'
	
	if (view === 'year') {
		if (yearParam) {
			const year = parseInt(yearParam)
			if (year >= 2020 && year <= 2030) {
				return { view: 'year' as const, year, month: 1 }
			}
		}
		const now = new Date()
		return { view: 'year' as const, year: now.getFullYear(), month: 1 }
	} else {
		if (monthParam) {
			const [year, month] = monthParam.split('-').map(Number)
			if (year && month >= 1 && month <= 12) {
				return { view: 'month' as const, year, month }
			}
		}
		const now = new Date()
		return { view: 'month' as const, year: now.getFullYear(), month: now.getMonth() + 1 }
	}
}

async function SummaryCards({ 
	view, 
	year, 
	month 
}: { 
	view: 'month' | 'year'
	year: number
	month: number 
}) {
	const [totalBalance, income, expense, incomeVsExpense] = await Promise.all([
		getTotalBalance(),
		view === 'year' 
			? getYearlyIncome(year)
			: getMonthlyIncome(year, month),
		view === 'year'
			? getYearlyExpense(year)
			: getMonthlyExpense(year, month),
		view === 'year'
			? getYearlyIncomeVsExpense(year)
			: getIncomeVsExpense(year, month),
	])

	const netAmount = income - expense
	const savingsRate = income > 0 ? (netAmount / income) * 100 : 0
	const periodLabel = view === 'year' ? 'Yearly' : 'Monthly'

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-l-4 border-l-primary">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-0">
					<CardTitle className="text-sm font-medium">Total Balance</CardTitle>
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Wallet className="h-5 w-5 text-primary" />
					</div>
				</CardHeader>
				<CardContent className="relative z-0">
					<DashboardBalance amount={totalBalance} currency={DEFAULT_CURRENCY} />
				</CardContent>
			</Card>
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-l-4 border-l-green-500">
				<div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-0">
					<CardTitle className="text-sm font-medium">{periodLabel} Income</CardTitle>
					<div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
						<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
				</CardHeader>
				<CardContent className="relative z-0">
					<DashboardBalance 
						amount={income.toString()} 
						currency={DEFAULT_CURRENCY} 
						className="text-green-600 dark:text-green-400"
					/>
				</CardContent>
			</Card>
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-l-4 border-l-red-500">
				<div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-0">
					<CardTitle className="text-sm font-medium">{periodLabel} Expense</CardTitle>
					<div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
						<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
					</div>
				</CardHeader>
				<CardContent className="relative z-0">
					<DashboardBalance 
						amount={expense.toString()} 
						currency={DEFAULT_CURRENCY} 
						className="text-red-600 dark:text-red-400"
					/>
				</CardContent>
			</Card>
			<Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-l-4 border-l-purple-500">
				<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-0">
					<CardTitle className="text-sm font-medium">Net Savings</CardTitle>
					<div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
						<Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
					</div>
				</CardHeader>
				<CardContent className="relative z-0">
					<div className="space-y-1">
						<DashboardBalance 
							amount={netAmount.toFixed(2)} 
							currency={DEFAULT_CURRENCY} 
							className={netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
						/>
						<p className="text-xs text-muted-foreground">
							{savingsRate.toFixed(1)}% savings rate
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

async function OverviewStatsCards() {
	const stats = await getOverviewStats()

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card className="transition-all duration-200 hover:shadow-md">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">Accounts</p>
							<p className="text-2xl font-bold">{stats.accounts}</p>
						</div>
						<div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
							<Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</CardContent>
			</Card>
			<Card className="transition-all duration-200 hover:shadow-md">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-muted-foreground mb-1">Goals</p>
							<p className="text-2xl font-bold">{stats.goals}</p>
						</div>
						<div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
							<Target className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

async function RecentTransactionsList() {
	const [transactions, stats] = await Promise.all([
		getRecentTransactions(5),
		getOverviewStats(),
	])

	if (transactions.length === 0) {
		return (
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
					<CardTitle>Recent Transactions</CardTitle>
						<div className="flex items-center gap-2">
							<Receipt className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">{stats.transactions} total</span>
						</div>
					</div>
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
				<div className="flex items-center justify-between">
				<CardTitle>Recent Transactions</CardTitle>
					<div className="flex items-center gap-2">
						<Receipt className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">{stats.transactions} total</span>
					</div>
				</div>
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
									{formatDateShort(transaction.date)}
									{transaction.categoryName && ` • ${transaction.categoryName}`}
								</p>
							</div>
							<TransactionAmount
								amount={transaction.amount || '0'}
								currency={transaction.currency || DEFAULT_CURRENCY}
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
	const { view, year, month } = parsePeriodFromSearchParams(
		resolvedSearchParams.month,
		resolvedSearchParams.year,
		resolvedSearchParams.view
	)

	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Dashboard</h1>
					<p className="text-muted-foreground">
						Overview of your finances
					</p>
				</div>
				<Suspense fallback={<div className="h-9 w-[340px] bg-muted rounded animate-pulse" />}>
					<PeriodPicker />
				</Suspense>
			</div>

			<Suspense
				fallback={
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
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
				<SummaryCards view={view} year={year} month={month} />
			</Suspense>

			<Suspense fallback={<div className="grid gap-4 md:grid-cols-2"><div className="h-24 bg-muted rounded animate-pulse" /><div className="h-24 bg-muted rounded animate-pulse" /></div>}>
				<OverviewStatsCards />
			</Suspense>

			<div className="grid gap-6 lg:grid-cols-2">
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
					<IncomeExpenseChartWrapper view={view} year={year} month={month} />
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
					<CategoryBreakdownChartWrapper view={view} year={year} month={month} />
				</Suspense>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
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
					<FrequentExpensesList view={view} year={year} month={month} />
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
					<SingleExpensesList view={view} year={year} month={month} />
				</Suspense>
			</div>

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
				<ExpensesChartWrapper view={view} year={year} month={month} />
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
		</div>
	)
}

async function IncomeExpenseChartWrapper({ 
	view, 
	year, 
	month 
}: { 
	view: 'month' | 'year'
	year: number
	month: number 
}) {
	const { income, expense } = view === 'year'
		? await getYearlyIncomeVsExpense(year)
		: await getIncomeVsExpense(year, month)
	return <IncomeExpenseChart income={income} expense={expense} currency={DEFAULT_CURRENCY} />
}

async function CategoryBreakdownChartWrapper({ 
	view, 
	year, 
	month 
}: { 
	view: 'month' | 'year'
	year: number
	month: number 
}) {
	const [categoryData, stats] = await Promise.all([
		view === 'year'
			? getYearlyTopExpensesByCategory(year)
			: getTopExpensesByCategory(year, month),
		getOverviewStats(),
	])
	return <CategoryBreakdownChart data={categoryData} categoriesCount={stats.categories} />
}

async function FrequentExpensesList({ 
	view, 
	year, 
	month 
}: { 
	view: 'month' | 'year'
	year: number
	month: number 
}) {
	const expenses = view === 'year'
		? await getYearlyFrequentExpenses(year)
		: await getFrequentExpenses(year, month)

	const periodLabel = view === 'year' ? 'this year' : 'this month'

	if (expenses.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Repeat className="h-5 w-5" />
						Frequent Expenses
					</CardTitle>
					<CardDescription>Recurring expenses {periodLabel}</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<Repeat className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">No frequent expenses</h3>
					<p className="text-sm text-muted-foreground">
						Mark transactions as recurrent to see them here
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Repeat className="h-5 w-5 text-primary" />
					Frequent Expenses
				</CardTitle>
				<CardDescription>Recurring expenses {periodLabel}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{expenses.map((expense, index) => (
						<div
							key={index}
							className="flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-accent/50 border-b last:border-0"
						>
							<div className="flex items-center gap-3 flex-1">
								<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<Repeat className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium">{expense.description}</p>
									{expense.categoryName && (
										<p className="text-xs text-muted-foreground">{expense.categoryName}</p>
									)}
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm font-semibold text-red-600 dark:text-red-400">
									{formatCurrency(expense.amount, expense.currency)}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

async function SingleExpensesList({ 
	view, 
	year, 
	month 
}: { 
	view: 'month' | 'year'
	year: number
	month: number 
}) {
	const expenses = view === 'year'
		? await getYearlySingleExpenses(year)
		: await getSingleExpenses(year, month)

	const periodLabel = view === 'year' ? 'this year' : 'this month'

	if (expenses.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						Top Single Expenses
					</CardTitle>
					<CardDescription>Largest one-time expenses {periodLabel}</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<Zap className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">No single expenses</h3>
					<p className="text-sm text-muted-foreground">
						One-time expenses will appear here
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
					Top Single Expenses
				</CardTitle>
				<CardDescription>Largest one-time expenses {periodLabel}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{expenses.map((expense, index) => (
						<div
							key={index}
							className="flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:bg-accent/50 border-b last:border-0"
						>
							<div className="flex items-center gap-3 flex-1">
								<div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
									<Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-medium">{expense.description}</p>
									<div className="flex items-center gap-2 mt-1">
										{expense.categoryName && (
											<p className="text-xs text-muted-foreground">{expense.categoryName}</p>
										)}
										<span className="text-xs text-muted-foreground">•</span>
										<p className="text-xs text-muted-foreground">
											{formatDateCompact(expense.date)}
										</p>
									</div>
								</div>
							</div>
							<div className="text-right">
								<p className="text-sm font-semibold text-red-600 dark:text-red-400">
									{formatCurrency(expense.amount, expense.currency)}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

async function ExpensesChartWrapper({
	view,
	year,
	month,
}: {
	view: 'month' | 'year'
	year: number
	month: number
}) {
	if (view === 'year') {
		const monthlyExpenses = await getMonthlyExpensesForYear(year)
		return <YearlyExpensesChart data={monthlyExpenses} />
	} else {
		const dailyExpenses = await getDailyExpensesForMonth(year, month)
		return <MonthlyExpensesChart data={dailyExpenses} />
	}
}
