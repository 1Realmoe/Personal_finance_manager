'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Receipt, Tag, Target, Settings, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BalanceToggle } from '@/components/features/balance-toggle'
import { UserButton } from '@clerk/nextjs'

const navigation = [
	{
		name: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		name: 'Transactions',
		href: '/dashboard/transactions',
		icon: Receipt,
	},
	{
		name: 'Accounts',
		href: '/dashboard/accounts',
		icon: Wallet,
	},
	{
		name: 'Categories',
		href: '/dashboard/categories',
		icon: Tag,
	},
	{
		name: 'Goals',
		href: '/dashboard/goals',
		icon: Target,
	},
	{
		name: 'Investments',
		href: '/dashboard/investments',
		icon: TrendingUp,
	},
	{
		name: 'Settings',
		href: '/dashboard/settings',
		icon: Settings,
	},
]

export function Sidebar() {
	return (
		<div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
			<div className="flex h-16 items-center border-b px-6 bg-card/80">
				<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
					FinTrack
				</h1>
			</div>
			<div className="border-b p-4 bg-card/80 flex-shrink-0">
				<BalanceToggle />
			</div>
			<nav className="flex-1 space-y-1 p-4 overflow-y-auto">
				{navigation.map((item) => {
					const Icon = item.icon
					return (
						<SidebarLink key={item.href} href={item.href}>
							<Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
							{item.name}
						</SidebarLink>
					)
				})}
			</nav>
			<div className="border-t p-4 bg-card/80">
				<div className="flex items-center justify-center">
					<UserButton />
				</div>
			</div>
		</div>
	)
}

function SidebarLink({
	href,
	children,
}: {
	href: string
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const isActive = pathname === href

	return (
		<Link
			href={href}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
				isActive
					? 'bg-primary text-primary-foreground shadow-sm'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-1'
			)}
		>
			{children}
		</Link>
	)
}

