import { CurrencyDisplay } from './currency-display'
import { DEFAULT_CURRENCY } from '@/lib/format'

/**
 * Account Balance Display
 * Used for displaying account balances in account cards
 */
interface AccountBalanceProps {
	balance: string
	currency: string
	className?: string
}

export function AccountBalance({ balance, currency, className }: AccountBalanceProps) {
	return (
		<CurrencyDisplay
			amount={balance || '0'}
			currency={currency || DEFAULT_CURRENCY}
			className={className}
			size="xl"
		/>
	)
}

/**
 * Additional Currency Balance Display
 * Used for displaying additional currency balances in account cards
 */
interface AdditionalCurrencyBalanceProps {
	balance: string
	currency: string
	className?: string
}

export function AdditionalCurrencyBalance({ balance, currency, className }: AdditionalCurrencyBalanceProps) {
	return (
		<CurrencyDisplay
			amount={balance || '0'}
			currency={currency}
			className={className || 'text-muted-foreground'}
			size="sm"
		/>
	)
}

/**
 * Dashboard Balance Display
 * Used for displaying balances on the dashboard
 */
interface DashboardBalanceProps {
	amount: number | string
	currency?: string
	className?: string
}

export function DashboardBalance({ amount, currency = DEFAULT_CURRENCY, className }: DashboardBalanceProps) {
	return (
		<CurrencyDisplay
			amount={amount}
			currency={currency}
			className={className}
			size="xl"
		/>
	)
}

/**
 * Portfolio Value Display
 * Used for displaying investment portfolio values
 */
interface PortfolioValueDisplayProps {
	value: number
	currency: string
	className?: string
}

export function PortfolioValueDisplay({ value, currency, className }: PortfolioValueDisplayProps) {
	return (
		<CurrencyDisplay
			amount={value}
			currency={currency || DEFAULT_CURRENCY}
			className={className}
			size="lg"
		/>
	)
}

