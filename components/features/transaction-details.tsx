'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDateFull, DEFAULT_CURRENCY } from '@/lib/format'
import { Calendar, Wallet, Tag, DollarSign, Repeat, FileText, TrendingUp, TrendingDown } from 'lucide-react'

interface TransactionDetailsProps {
	transaction: {
		id: string
		amount: string
		description: string
		date: Date | string
		accountName: string | null
		categoryName?: string | null
		type: 'INCOME' | 'EXPENSE'
		currency?: string
		source?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
	}
	open: boolean
	onOpenChange: (open: boolean) => void
}

const frequencyLabels: Record<string, string> = {
	DAILY: 'Daily',
	WEEKLY: 'Weekly',
	MONTHLY: 'Monthly',
	YEARLY: 'Yearly',
}

export function TransactionDetails({ transaction, open, onOpenChange }: TransactionDetailsProps) {
	const dateObj = typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date
	const isIncome = transaction.type === 'INCOME'
	const currency = transaction.currency || DEFAULT_CURRENCY

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="space-y-3 pb-6 border-b">
					<DialogTitle className="text-2xl font-semibold">Transaction Details</DialogTitle>
					<DialogDescription className="text-base">
						View all information about this transaction
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-6">
					{/* Amount - Prominent Display */}
					<div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/50">
						<p className="text-sm text-muted-foreground mb-2">Amount</p>
						<p className={`text-3xl font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
							{isIncome ? '+' : '-'}
							{formatCurrency(transaction.amount || '0', currency)}
						</p>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<FileText className="h-4 w-4" />
							<span className="font-medium">Description</span>
						</div>
						<p className="text-base font-medium pl-6">{transaction.description}</p>
					</div>

					{/* Transaction Type */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							{isIncome ? (
								<TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
							)}
							<span className="font-medium">Type</span>
						</div>
						<div className="pl-6">
							<span
								className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
									isIncome
										? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
										: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
								}`}
							>
								{transaction.type}
							</span>
						</div>
					</div>

					{/* Date */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span className="font-medium">Date</span>
						</div>
						<p className="text-base pl-6">{formatDateFull(dateObj)}</p>
					</div>

					{/* Account */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Wallet className="h-4 w-4" />
							<span className="font-medium">Account</span>
						</div>
						<p className="text-base pl-6">{transaction.accountName || '—'}</p>
					</div>

					{/* Category */}
					{transaction.categoryName && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Tag className="h-4 w-4" />
								<span className="font-medium">Category</span>
							</div>
							<p className="text-base pl-6">{transaction.categoryName}</p>
						</div>
					)}

					{/* Source */}
					{transaction.source && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<DollarSign className="h-4 w-4" />
								<span className="font-medium">Source</span>
							</div>
							<p className="text-base pl-6">{transaction.source}</p>
						</div>
					)}

					{/* Recurring Information */}
					{transaction.isRecurrent && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Repeat className="h-4 w-4" />
								<span className="font-medium">Recurring Transaction</span>
							</div>
							<div className="pl-6 space-y-1">
								<p className="text-base">This is a recurring transaction</p>
								{transaction.recurrenceFrequency && (
									<p className="text-sm text-muted-foreground">
										Frequency: <span className="font-medium">{frequencyLabels[transaction.recurrenceFrequency]}</span>
									</p>
								)}
							</div>
						</div>
					)}

					{/* Currency */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<DollarSign className="h-4 w-4" />
							<span className="font-medium">Currency</span>
						</div>
						<p className="text-base pl-6">{currency}</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

