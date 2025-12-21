'use client'

import { useState } from 'react'
import { TransactionForm } from './transaction-form'
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
import { useRouter } from 'next/navigation'

interface AddTransactionDialogProps {
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
		additionalCurrencies?: Array<{ currency: string; balance: string }>
	}>
	categories: Array<{ id: string; name: string; type: 'INCOME' | 'EXPENSE' }>
}

export function AddTransactionSheet({
	accounts,
	categories,
}: AddTransactionDialogProps) {
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const handleSuccess = () => {
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
					<Plus className="mr-2 h-4 w-4" />
					Add Transaction
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader className="space-y-3 pb-6 border-b">
					<DialogTitle className="text-2xl font-semibold">Add Transaction</DialogTitle>
					<DialogDescription className="text-base">
						Create a new income or expense transaction
					</DialogDescription>
				</DialogHeader>
				<div className="mt-6">
					<TransactionForm
						accounts={accounts}
						categories={categories}
						onSuccess={handleSuccess}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}

