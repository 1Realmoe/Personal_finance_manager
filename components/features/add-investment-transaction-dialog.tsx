'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { InvestmentTransactionForm } from './investment-transaction-form'
import { useRouter } from 'next/navigation'

interface AddInvestmentTransactionDialogProps {
	accounts?: Array<{ id: string; name: string }>
	accountId?: string
	holdings?: Array<{
		id: string
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
	}>
	trigger?: React.ReactNode
	initialData?: {
		id?: string
		type?: 'BUY' | 'SELL'
		symbol?: string
		assetType?: 'STOCK' | 'CRYPTO'
		quantity?: string
		price?: string
		date?: Date
		currency?: string
		holdingId?: string
	}
	onSuccess?: () => void
}

export function AddInvestmentTransactionDialog({
	accounts,
	accountId,
	holdings = [],
	trigger,
	initialData,
	onSuccess,
}: AddInvestmentTransactionDialogProps) {
	const [open, setOpen] = useState(!!initialData)
	const router = useRouter()

	const handleSuccess = () => {
		setOpen(false)
		onSuccess?.()
		router.refresh()
	}

	const isEdit = !!initialData?.id

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{!isEdit && (
				<DialogTrigger asChild>
					{trigger || (
						<Button variant="outline">
							<Plus className="mr-2 h-4 w-4" />
							Record Transaction
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Edit Investment Transaction' : 'Record Investment Transaction'}</DialogTitle>
					<DialogDescription>
						{isEdit 
							? 'Update transaction details' 
							: 'Record a buy or sell transaction. This will automatically create or update holdings with calculated average purchase prices.'}
					</DialogDescription>
				</DialogHeader>
				{!isEdit && (
					<div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
						<p className="text-sm text-foreground">
							<strong>Recommended:</strong> Use transactions to track your actual trades. Holdings are automatically created and updated based on your transactions.
						</p>
					</div>
				)}
				<InvestmentTransactionForm
					accountId={accountId}
					accounts={accounts}
					holdings={holdings}
					initialData={initialData}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	)
}

