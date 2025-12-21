'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

export function BalanceToggle() {
	const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility()

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggleBalanceVisibility}
			className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
		>
			{isBalanceVisible ? (
				<Eye className="h-4 w-4" />
			) : (
				<EyeOff className="h-4 w-4" />
			)}
			<span className="text-sm font-medium">
				{isBalanceVisible ? 'Hide Balances' : 'Show Balances'}
			</span>
		</Button>
	)
}

