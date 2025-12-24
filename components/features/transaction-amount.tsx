'use client'

import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface TransactionAmountProps {
	amount: string
	currency: string
	type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
	className?: string
}

export function TransactionAmount({ amount, currency, type, className }: TransactionAmountProps) {
	const { isBalanceVisible } = useBalanceVisibility()

	if (!isBalanceVisible) {
		return (
			<span className={`text-right font-semibold ${className || ''}`}>
				••••••
			</span>
		)
	}

	const isTransfer = type === 'TRANSFER'
	const isIncome = type === 'INCOME'

	return (
		<span
			className={`text-right font-semibold transition-colors ${
				isIncome
					? 'text-green-600 dark:text-green-400'
					: isTransfer
					? 'text-blue-600 dark:text-blue-400'
					: 'text-red-600 dark:text-red-400'
			} ${className || ''}`}
		>
			{isIncome ? '+' : isTransfer ? '' : '-'}
			{formatCurrency(amount || '0', currency || DEFAULT_CURRENCY)}
		</span>
	)
}

