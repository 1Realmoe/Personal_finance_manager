'use client'

import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/currency'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface PortfolioValueDisplayProps {
	value: number
	currency: string
	className?: string
}

export function PortfolioValueDisplay({ value, currency, className }: PortfolioValueDisplayProps) {
	const { isBalanceVisible } = useBalanceVisibility()

	if (!isBalanceVisible) {
		return (
			<div className={`font-bold ${className || ''}`}>
				••••••
			</div>
		)
	}

	return (
		<div className={`font-bold ${className || ''}`}>
			{formatCurrency(value, currency || DEFAULT_CURRENCY)}
		</div>
	)
}

