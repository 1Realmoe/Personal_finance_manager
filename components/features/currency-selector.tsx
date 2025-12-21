'use client'

import { useCurrency } from '@/contexts/currency-context'
import { currencies, CurrencyCode } from '@/lib/currency'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

export function CurrencySelector() {
	const { baseCurrency, setBaseCurrency, isLoading } = useCurrency()

	if (isLoading) {
		return (
			<Select disabled>
				<SelectTrigger>
					<SelectValue placeholder="Loading..." />
				</SelectTrigger>
			</Select>
		)
	}

	return (
		<Select
			value={baseCurrency}
			onValueChange={(value) => setBaseCurrency(value as CurrencyCode)}
		>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{currencies.map((currency) => (
					<SelectItem key={currency.code} value={currency.code}>
						{currency.symbol} {currency.name} ({currency.code})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

