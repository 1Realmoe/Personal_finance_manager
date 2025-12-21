import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAccounts } from '@/lib/data/accounts'
import { AccountActions } from '@/components/features/account-actions'
import { formatCurrency } from '@/lib/currency'
import Image from 'next/image'

async function AccountsList() {
	const accounts = await getAccounts()

	if (accounts.length === 0) {
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

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{accounts.map((account, index) => {
				const hasCardImage = account.cardImage && account.cardImage.trim() !== ''
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
									<CardTitle className={`group-hover:text-primary transition-colors flex-1 ${hasCardImage ? 'text-foreground' : ''}`}>
										{account.name}
									</CardTitle>
									<div className="flex items-center gap-2">
										<div
											className="h-4 w-4 rounded-full transition-transform group-hover:scale-125 shadow-sm"
											style={{ backgroundColor: account.color }}
										/>
										<AccountActions account={{
											...account,
											cardImage: account.cardImage || undefined,
										}} />
									</div>
								</div>
								<CardDescription className={`capitalize ${hasCardImage ? 'text-foreground/70' : ''}`}>
									{account.type.toLowerCase()}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className={`text-2xl font-bold transition-colors group-hover:text-primary ${hasCardImage ? 'text-foreground' : ''}`}>
										{formatCurrency(account.balance || '0', account.currency || 'USD')}
									</div>
									{account.additionalCurrencies && account.additionalCurrencies.length > 0 && (
										<div className="space-y-1">
											{account.additionalCurrencies.map((ac: { currency: string; balance: string }) => (
												<div key={ac.currency} className={`text-sm ${hasCardImage ? 'text-foreground/70' : 'text-muted-foreground'}`}>
													{formatCurrency(ac.balance || '0', ac.currency)}
												</div>
											))}
										</div>
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
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
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

