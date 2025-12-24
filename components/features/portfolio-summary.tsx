'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface PortfolioSummaryProps {
	totalValue: number
	totalCost: number
	gainLoss: number
	gainLossPercent: number
	baseCurrency: string
	holdingsCount: number
}

export function PortfolioSummary({
	totalValue,
	totalCost,
	gainLoss,
	gainLossPercent,
	baseCurrency,
	holdingsCount,
}: PortfolioSummaryProps) {
	const { isBalanceVisible } = useBalanceVisibility()
	const isPositive = gainLoss >= 0
	
	const formatAmount = (amount: number) => {
		if (!isBalanceVisible) return '••••••'
		return formatCurrency(amount, baseCurrency || DEFAULT_CURRENCY)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="transition-all duration-200 hover:shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
					<Wallet className="h-5 w-5 text-primary" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatAmount(totalValue)}
					</div>
				</CardContent>
			</Card>

			<Card className="transition-all duration-200 hover:shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Cost Basis</CardTitle>
					<Target className="h-5 w-5 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{formatAmount(totalCost)}
					</div>
				</CardContent>
			</Card>

			<Card className="transition-all duration-200 hover:shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
					{isPositive ? (
						<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
					) : (
						<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
					)}
				</CardHeader>
				<CardContent>
					<div
						className={cn(
							'text-2xl font-bold',
							isPositive
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'
						)}
					>
						{isPositive ? '+' : ''}
						{formatAmount(gainLoss)}
					</div>
				</CardContent>
			</Card>

			<Card className="transition-all duration-200 hover:shadow-lg">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Gain/Loss %</CardTitle>
					{isPositive ? (
						<TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
					) : (
						<TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
					)}
				</CardHeader>
				<CardContent>
					<div
						className={cn(
							'text-2xl font-bold',
							isPositive
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'
						)}
					>
						{isPositive ? '+' : ''}
						{isBalanceVisible ? (gainLossPercent === 0 ? '0.00' : gainLossPercent.toFixed(2)) : '•••'}%
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						{holdingsCount} {holdingsCount === 1 ? 'holding' : 'holdings'}
					</p>
				</CardContent>
			</Card>
		</div>
	)
}

