import { Sidebar } from '@/components/sidebar'
import { BalanceVisibilityProvider } from '@/contexts/balance-visibility-context'
import { CurrencyProvider } from '@/contexts/currency-context'

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<BalanceVisibilityProvider>
			<CurrencyProvider>
				<div className="flex h-screen overflow-hidden bg-background">
					<Sidebar />
					<main className="flex-1 overflow-y-auto bg-background lg:ml-0">
						<div className="min-h-full">
							{children}
						</div>
					</main>
				</div>
			</CurrencyProvider>
		</BalanceVisibilityProvider>
	)
}

