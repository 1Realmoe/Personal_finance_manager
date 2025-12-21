import { Sidebar } from '@/components/sidebar'
import { BalanceVisibilityProvider } from '@/contexts/balance-visibility-context'

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<BalanceVisibilityProvider>
			<div className="flex h-screen overflow-hidden bg-background">
				<Sidebar />
				<main className="flex-1 overflow-y-auto bg-background">
					<div className="min-h-full">
						{children}
					</div>
				</main>
			</div>
		</BalanceVisibilityProvider>
	)
}

