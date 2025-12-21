'use client'

import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface DashboardBalanceProps {
	amount: number | string
	currency?: string
	className?: string
}

export function DashboardBalance({ amount, currency = DEFAULT_CURRENCY, className }: DashboardBalanceProps) {
	const { isBalanceVisible } = useBalanceVisibility()

	if (!isBalanceVisible) {
		return (
			<div className={`text-2xl font-bold ${className || ''}`}>
				••••••
			</div>
		)
	}

	return (
		<div className={`text-2xl font-bold ${className || ''}`}>
			{formatCurrency(typeof amount === 'string' ? amount : amount.toString(), currency)}
		</div>
	)
}

