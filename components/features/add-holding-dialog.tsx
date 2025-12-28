'use client'

import { AddHoldingForm } from './add-holding-form'
import { FormDialog } from './form-dialog'

interface AddHoldingDialogProps {
	accounts?: Array<{ id: string; name: string }>
	accountId?: string
	trigger?: React.ReactNode
}

export function AddHoldingDialog({ accounts, accountId, trigger }: AddHoldingDialogProps) {
	return (
		<FormDialog
			title="Add Holding Manually"
			description="Manually add a holding without recording a transaction. Use this for importing existing positions or quick setup."
			triggerLabel="Add Holding"
			trigger={trigger}
			maxWidth="2xl"
			showInfoBox
			infoBoxContent={
				<p className="text-sm text-muted-foreground">
					<strong>Tip:</strong> For tracking actual trades, use <strong>"Record Transaction"</strong> instead. 
					Transactions automatically create and update holdings with proper average purchase price calculations.
				</p>
			}
		>
			{(onSuccess) => (
				<AddHoldingForm
					accountId={accountId}
					accounts={accounts}
					onSuccess={onSuccess}
				/>
			)}
		</FormDialog>
	)
}

