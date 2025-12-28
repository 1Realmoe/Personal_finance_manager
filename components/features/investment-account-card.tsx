'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountActions } from '@/components/features/account-actions'
import { DEFAULT_CURRENCY } from '@/lib/currency'
import { PortfolioValueDisplay } from '@/components/features/balance-displays'

interface InvestmentAccountCardProps {
	account: {
		id: string
		name: string
		type: 'CURRENT' | 'SAVINGS' | 'CASH' | 'INVESTMENT'
		color: string
		balance: string | null
		currency: string | null
		cardImage?: string | null
		additionalCurrencies?: Array<{ currency: string; balance: string }>
	}
	portfolioValue: number
}

export function InvestmentAccountCard({ account, portfolioValue }: InvestmentAccountCardProps) {
	return (
		<Card key={account.id} className="transition-all duration-200 hover:shadow-lg cursor-pointer group">
			<Link href={`/dashboard/investments/${account.id}`} className="block">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div
								className="h-4 w-4 rounded-full"
								style={{ backgroundColor: account.color }}
							/>
							<CardTitle className="group-hover:text-primary transition-colors">{account.name}</CardTitle>
						</div>
						<div onClick={(e) => e.preventDefault()}>
							<AccountActions account={{
								...account,
								currency: account.currency || undefined,
								cardImage: account.cardImage || undefined,
							}} />
						</div>
					</div>
					<CardDescription className="capitalize">{account.type.toLowerCase()}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-1">
						<div className="text-sm text-muted-foreground">Portfolio Value</div>
						<PortfolioValueDisplay
							value={portfolioValue}
							currency={account.currency || DEFAULT_CURRENCY}
							className="text-2xl"
						/>
					</div>
				</CardContent>
			</Link>
		</Card>
	)
}

