import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAccounts } from '@/lib/data/accounts'
import { getPortfolioValue } from '@/lib/data/investments'
import { AccountActions } from '@/components/features/account-actions'
import { AccountBalance, AdditionalCurrencyBalance, PortfolioValueDisplay } from '@/components/features/balance-displays'
import { DEFAULT_CURRENCY } from '@/lib/format'
import { getUserBaseCurrency } from '@/lib/actions/user'
import Image from 'next/image'

async function AccountsList() {
	const accounts = await getAccounts()
	
	// Calculate portfolio values for investment accounts
	const accountsWithValues = await Promise.all(
		accounts.map(async (account) => {
			if (account.type === 'INVESTMENT') {
				const portfolioValue = await getPortfolioValue(account.id)
				return {
					...account,
					portfolioValue,
				}
			}
			return account
		})
	)

	if (accountsWithValues.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Accounts</CardTitle>
					<CardDescription>Your bank accounts and balances</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 text-muted-foreground"
						>
							<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a2 2 0 0 0 0 4h16a1 1 0 0 0 1-1v-2.5a3.5 3.5 0 0 1 6.8 1.3 3.5 3.5 0 0 1-2.8 2.8V22" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold mb-2">No accounts yet</h3>
					<p className="text-sm text-muted-foreground">
						Create your first account to get started!
					</p>
				</CardContent>
			</Card>
		)
	}

	const baseCurrency = await getUserBaseCurrency()

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{accountsWithValues.map((account, index) => {
				const hasCardImage = account.cardImage && account.cardImage.trim() !== ''
				const isInvestmentAccount = account.type === 'INVESTMENT'
				const portfolioValue = 'portfolioValue' in account ? account.portfolioValue : undefined
				
				return (
					<Card
						key={account.id}
						className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group relative ${hasCardImage ? 'overflow-hidden' : ''}`}
					>
						{/* Card Background Image with Fade - Only if cardImage is set */}
						{hasCardImage && (
							<div className="absolute inset-0 z-0">
								<div className="relative w-full h-full">
									<Image
										src={account.cardImage!}
										alt={`${account.name} card`}
										fill
										className="object-cover object-right"
										style={{
											maskImage: 'linear-gradient(to right, transparent 0%, transparent 30%, black 60%, black 100%)',
											WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 30%, black 60%, black 100%)',
										}}
										priority={index < 3}
									/>
									{/* Additional fade overlay from left */}
									<div 
										className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"
										style={{
											background: 'linear-gradient(to right, hsl(var(--background)) 0%, hsl(var(--background)) 30%, transparent 60%)',
										}}
									/>
								</div>
							</div>
						)}

						{/* Content */}
						<div className={`relative ${hasCardImage ? 'z-10' : ''}`}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 flex-1">
										<div
											className="h-4 w-4 rounded-full transition-transform group-hover:scale-125 shadow-sm flex-shrink-0"
											style={{ backgroundColor: account.color }}
										/>
										<CardTitle className={`group-hover:text-primary transition-colors ${hasCardImage ? 'text-foreground' : ''}`}>
											{account.name}
										</CardTitle>
									</div>
									<AccountActions account={{
										...account,
										cardImage: account.cardImage || undefined,
									}} />
								</div>
								<CardDescription className={`capitalize ${hasCardImage ? 'text-foreground/70' : ''}`}>
									{account.type.toLowerCase()}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{isInvestmentAccount && portfolioValue !== undefined ? (
										<div className={`transition-colors group-hover:text-primary ${hasCardImage ? 'text-foreground' : ''}`}>
											<div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
											<PortfolioValueDisplay
												value={portfolioValue}
												currency={baseCurrency}
												className="text-2xl"
											/>
										</div>
									) : (
										<>
											<AccountBalance
												balance={account.balance || '0'}
												currency={account.currency || DEFAULT_CURRENCY}
												className={`transition-colors group-hover:text-primary ${hasCardImage ? 'text-foreground' : ''}`}
											/>
											{account.additionalCurrencies && account.additionalCurrencies.length > 0 && (
												<div className="space-y-1">
													{account.additionalCurrencies.map((ac: { currency: string; balance: string }) => (
														<AdditionalCurrencyBalance
															key={ac.currency}
															balance={ac.balance || '0'}
															currency={ac.currency}
															className={hasCardImage ? 'text-foreground/70' : ''}
														/>
													))}
												</div>
											)}
										</>
									)}
								</div>
							</CardContent>
						</div>
					</Card>
				)
			})}
		</div>
	)
}

export default async function AccountsPage() {
	return (
		<div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6 lg:pt-8 space-y-6 sm:space-y-8">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold mb-2">Accounts</h1>
					<p className="text-muted-foreground">
						View and manage your bank accounts
					</p>
				</div>
				<AccountActions />
			</div>

			<Suspense
				fallback={
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-6 w-32 bg-muted rounded" />
								</CardHeader>
								<CardContent>
									<div className="h-8 w-24 bg-muted rounded" />
								</CardContent>
							</Card>
						))}
					</div>
				}
			>
				<AccountsList />
			</Suspense>
		</div>
	)
}

