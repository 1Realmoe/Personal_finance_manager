'use client'

import { InvestmentTransactionForm } from './investment-transaction-form'
import { FormDialog } from './form-dialog'

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
	const isEdit = !!initialData?.id

	return (
		<FormDialog
			title={isEdit ? 'Edit Investment Transaction' : 'Record Investment Transaction'}
			description={
				isEdit 
					? 'Update transaction details' 
					: 'Record a buy or sell transaction. This will automatically create or update holdings with calculated average purchase prices.'
			}
			triggerLabel="Record Transaction"
			trigger={!isEdit ? trigger : undefined}
			maxWidth="2xl"
			initialOpen={!!initialData}
			showInfoBox={!isEdit}
			infoBoxContent={
				<p className="text-sm text-foreground">
					<strong>Recommended:</strong> Use transactions to track your actual trades. Holdings are automatically created and updated based on your transactions.
				</p>
			}
			onSuccess={onSuccess}
		>
			{(handleSuccess) => (
				<InvestmentTransactionForm
					accountId={accountId}
					accounts={accounts}
					holdings={holdings}
					initialData={initialData}
					onSuccess={handleSuccess}
				/>
			)}
		</FormDialog>
	)
}

