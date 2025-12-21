'use client'

import { formatCurrency } from '@/lib/currency'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface DashboardBalanceProps {
	amount: number | string
	currency?: string
	className?: string
}

export function DashboardBalance({ amount, currency = 'USD', className }: DashboardBalanceProps) {
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

