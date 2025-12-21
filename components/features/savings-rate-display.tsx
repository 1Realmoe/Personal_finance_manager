'use client'

import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface SavingsRateDisplayProps {
	rate: number
	className?: string
}

export function SavingsRateDisplay({ rate, className }: SavingsRateDisplayProps) {
	const { isBalanceVisible } = useBalanceVisibility()

	if (!isBalanceVisible) {
		return (
			<p className={`text-xs text-muted-foreground ${className || ''}`}>
				•••% savings rate
			</p>
		)
	}

	return (
		<p className={`text-xs text-muted-foreground ${className || ''}`}>
			{rate.toFixed(1)}% savings rate
		</p>
	)
}

