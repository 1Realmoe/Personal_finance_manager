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
import { Button } from '@/components/ui/button'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
import { HoldingActions } from '@/components/features/holding-actions'
import { cn } from '@/lib/utils'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface HoldingsTableProps {
	holdings: Array<{
		id: string
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
		averagePurchasePrice: string
		currentPrice: string
		currency: string
		accountId: string
	}>
	accountId?: string
}

export function HoldingsTable({ holdings, accountId }: HoldingsTableProps) {
	const { isBalanceVisible } = useBalanceVisibility()
	
	const formatAmount = (amount: number, currency: string) => {
		if (!isBalanceVisible) return '••••••'
		return formatCurrency(amount, currency || DEFAULT_CURRENCY)
	}
	
	if (holdings.length === 0) {
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
				<h3 className="text-lg font-semibold mb-2">No holdings yet</h3>
				<p className="text-sm text-muted-foreground">
					Add your first holding to get started!
				</p>
			</div>
		)
	}

	return (
		<div className="rounded-lg border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead>Symbol</TableHead>
						<TableHead>Asset Type</TableHead>
						<TableHead className="text-right">Quantity</TableHead>
						<TableHead className="text-right">Avg Purchase Price</TableHead>
						<TableHead className="text-right">Current Price</TableHead>
						<TableHead className="text-right">Current Value</TableHead>
						<TableHead className="text-right">Gain/Loss</TableHead>
						<TableHead className="text-right">Gain/Loss %</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{holdings.map((holding) => {
						const quantity = parseFloat(holding.quantity || '0')
						const avgPrice = parseFloat(holding.averagePurchasePrice || '0')
						const currentPrice = parseFloat(holding.currentPrice || '0')
						const currentValue = quantity * currentPrice
						const costBasis = quantity * avgPrice
						const gainLoss = currentValue - costBasis
						const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

						return (
							<TableRow key={holding.id} className="group">
								<TableCell className="font-medium font-mono">
									{holding.symbol}
								</TableCell>
								<TableCell>
									<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary">
										{holding.assetType}
									</span>
								</TableCell>
								<TableCell className="text-right font-mono">
									{quantity.toLocaleString('en-US', { maximumFractionDigits: 8 })}
								</TableCell>
								<TableCell className="text-right font-mono">
									{formatAmount(avgPrice, holding.currency || DEFAULT_CURRENCY)}
								</TableCell>
								<TableCell className="text-right font-mono">
									{formatAmount(currentPrice, holding.currency || DEFAULT_CURRENCY)}
								</TableCell>
								<TableCell className="text-right font-mono font-semibold">
									{formatAmount(currentValue, holding.currency || DEFAULT_CURRENCY)}
								</TableCell>
								<TableCell
									className={cn(
										'text-right font-mono font-semibold',
										gainLoss >= 0
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'
									)}
								>
									{gainLoss >= 0 ? '+' : ''}
									{formatAmount(gainLoss, holding.currency || DEFAULT_CURRENCY)}
								</TableCell>
								<TableCell
									className={cn(
										'text-right font-mono font-semibold',
										gainLossPercent >= 0
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'
									)}
								>
									{gainLossPercent >= 0 ? '+' : ''}
									{isBalanceVisible ? gainLossPercent.toFixed(2) : '•••'}%
								</TableCell>
								<TableCell>
									<div className="opacity-0 group-hover:opacity-100 transition-opacity">
										<HoldingActions
											holding={holding}
											accountId={accountId}
										/>
									</div>
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>
		</div>
	)
}

