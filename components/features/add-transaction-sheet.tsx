'use client'

import { TransactionForm } from './transaction-form'
import { FormDialog } from './form-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface AddTransactionSheetProps {
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
		additionalCurrencies?: Array<{ currency: string; balance: string }>
	}>
	categories: Array<{ id: string; name: string }>
	sources?: Array<{ id: string; name: string; icon: string }>
}

export function AddTransactionSheet({
	accounts,
	categories,
	sources = [],
}: AddTransactionSheetProps) {
	return (
		<FormDialog
			title="Add Transaction"
			description="Create a new income or expense transaction"
			triggerLabel="Add Transaction"
			trigger={
				<Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
					<Plus className="mr-2 h-4 w-4" />
					Add Transaction
				</Button>
			}
			maxWidth="lg"
		>
			{(onSuccess) => (
				<div className="mt-6">
					<TransactionForm
						accounts={accounts}
						categories={categories}
						sources={sources}
						onSuccess={onSuccess}
					/>
				</div>
			)}
		</FormDialog>
	)
}

