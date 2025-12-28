'use client'

import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'
import { cn } from '@/lib/utils'

interface CurrencyDisplayProps {
	amount: number | string
	currency?: string
	className?: string
	size?: 'sm' | 'md' | 'lg' | 'xl'
	hideWhenInvisible?: boolean
}

const sizeClasses = {
	sm: 'text-sm',
	md: 'text-base',
	lg: 'text-xl',
	xl: 'text-2xl font-bold',
}

export function CurrencyDisplay({ 
	amount, 
	currency = DEFAULT_CURRENCY, 
	className,
	size = 'xl',
	hideWhenInvisible = false,
}: CurrencyDisplayProps) {
	const { isBalanceVisible } = useBalanceVisibility()

	if (!isBalanceVisible) {
		if (hideWhenInvisible) {
			return null
		}
		return (
			<div className={cn(sizeClasses[size], 'font-bold', className)}>
				••••••
			</div>
		)
	}

	const amountStr = typeof amount === 'string' ? amount : amount.toString()
	const formatted = formatCurrency(amountStr, currency)

	return (
		<div className={cn(sizeClasses[size], 'font-bold', className)}>
			{formatted}
		</div>
	)
}

