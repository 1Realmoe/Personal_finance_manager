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
import { AddHoldingForm } from './add-holding-form'
import { useRouter } from 'next/navigation'

interface AddHoldingDialogProps {
	accounts?: Array<{ id: string; name: string }>
	accountId?: string
	trigger?: React.ReactNode
}

export function AddHoldingDialog({ accounts, accountId, trigger }: AddHoldingDialogProps) {
	const [open, setOpen] = useState(false)
	const router = useRouter()

	const handleSuccess = () => {
		setOpen(false)
		router.refresh()
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Add Holding
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add Holding Manually</DialogTitle>
					<DialogDescription>
						Manually add a holding without recording a transaction. Use this for importing existing positions or quick setup.
					</DialogDescription>
				</DialogHeader>
				<div className="mb-4 p-3 bg-muted/50 rounded-lg border border-dashed">
					<p className="text-sm text-muted-foreground">
						<strong>Tip:</strong> For tracking actual trades, use <strong>"Record Transaction"</strong> instead. 
						Transactions automatically create and update holdings with proper average purchase price calculations.
					</p>
				</div>
				<AddHoldingForm
					accountId={accountId}
					accounts={accounts}
					onSuccess={handleSuccess}
				/>
			</DialogContent>
		</Dialog>
	)
}

