'use client'

import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface AccountBalanceProps {
	balance: string
	currency: string
	className?: string
}

export function AccountBalance({ balance, currency, className }: AccountBalanceProps) {
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
			{formatCurrency(balance || '0', currency || DEFAULT_CURRENCY)}
		</div>
	)
}

interface AdditionalCurrencyBalanceProps {
	balance: string
	currency: string
	className?: string
}

export function AdditionalCurrencyBalance({ balance, currency, className }: AdditionalCurrencyBalanceProps) {
	const { isBalanceVisible } = useBalanceVisibility()

	if (!isBalanceVisible) {
		return (
			<div className={`text-sm ${className || 'text-muted-foreground'}`}>
				••••••
			</div>
		)
	}

	return (
		<div className={`text-sm ${className || 'text-muted-foreground'}`}>
			{formatCurrency(balance || '0', currency)}
		</div>
	)
}

