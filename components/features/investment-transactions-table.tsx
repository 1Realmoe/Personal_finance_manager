'use client'

import { formatDateShort } from '@/lib/format'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
import { Card, CardContent } from '@/components/ui/card'
import { InvestmentTransactionActions } from './investment-transaction-actions'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface InvestmentTransactionsTableProps {
	transactions: Array<{
		id: string
		accountId: string
		type: 'BUY' | 'SELL'
		symbol: string
		quantity: string
		price: string
		date: Date | string
		currency: string
		holdingId?: string | null
	}>
	holdings: Array<{
		id: string
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
		accountId?: string
		averagePurchasePrice?: string
	}>
}

export function InvestmentTransactionsTable({
	transactions,
	holdings,
}: InvestmentTransactionsTableProps) {
	const { isBalanceVisible } = useBalanceVisibility()
	
	const formatAmount = (amount: number, currency: string) => {
		if (!isBalanceVisible) return '••••••'
		return formatCurrency(amount, currency || DEFAULT_CURRENCY)
	}
	
	if (transactions.length === 0) {
		return (
			<Card className="border-dashed">
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
						Record your first buy or sell transaction
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b">
								<th className="text-left p-4 font-medium">Date</th>
								<th className="text-left p-4 font-medium">Type</th>
								<th className="text-left p-4 font-medium">Symbol</th>
								<th className="text-right p-4 font-medium">Quantity</th>
								<th className="text-right p-4 font-medium">Price</th>
								<th className="text-right p-4 font-medium">Total</th>
								<th className="w-[50px]"></th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction) => (
								<tr key={transaction.id} className="border-b last:border-0 group">
									<td className="p-4 text-muted-foreground">
										{formatDateShort(transaction.date)}
									</td>
									<td className="p-4">
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
												transaction.type === 'BUY'
													? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
													: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
											}`}
										>
											{transaction.type}
										</span>
									</td>
									<td className="p-4 font-mono font-medium">{transaction.symbol}</td>
									<td className="p-4 text-right font-mono">
										{parseFloat(transaction.quantity || '0').toLocaleString('en-US', {
											maximumFractionDigits: 8,
										})}
									</td>
									<td className="p-4 text-right font-mono">
										{formatAmount(
											parseFloat(transaction.price || '0'),
											transaction.currency || DEFAULT_CURRENCY
										)}
									</td>
									<td className="p-4 text-right font-mono font-semibold">
										{formatAmount(
											parseFloat(transaction.quantity || '0') *
												parseFloat(transaction.price || '0'),
											transaction.currency || DEFAULT_CURRENCY
										)}
									</td>
									<td onClick={(e) => e.stopPropagation()}>
										<div className="opacity-0 group-hover:opacity-100 transition-opacity">
											<InvestmentTransactionActions
												transactionId={transaction.id}
												transaction={{
													id: transaction.id,
													accountId: transaction.accountId,
													type: transaction.type,
													symbol: transaction.symbol,
													quantity: transaction.quantity,
													price: transaction.price,
													date: transaction.date,
													currency: transaction.currency,
													holdingId: transaction.holdingId,
												}}
												holdings={holdings}
											/>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	)
}

