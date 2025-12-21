'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Trash2, Edit } from 'lucide-react'
import { deleteInvestmentTransaction } from '@/lib/actions/investment'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AddInvestmentTransactionDialog } from './add-investment-transaction-dialog'

interface InvestmentTransactionActionsProps {
	transactionId: string
	transaction: {
		id: string
		accountId: string
		type: 'BUY' | 'SELL'
		symbol: string
		quantity: string
		price: string
		date: Date | string
		currency: string
		holdingId?: string | null
	}
	holdings: Array<{
		id: string
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
		accountId?: string
		averagePurchasePrice?: string
	}>
}

export function InvestmentTransactionActions({
	transactionId,
	transaction,
	holdings,
}: InvestmentTransactionActionsProps) {
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			const result = await deleteInvestmentTransaction(transactionId)
			if (result.success) {
				toast.success('Investment transaction deleted successfully')
				setDeleteOpen(false)
				router.refresh()
			} else {
				toast.error(result.error || 'Failed to delete transaction')
			}
		} catch (error) {
			toast.error('An unexpected error occurred')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent transition-colors">
						<MoreVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuItem
						onClick={() => setEditOpen(true)}
						className="cursor-pointer focus:bg-accent"
					>
						<Edit className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setDeleteOpen(true)}
						className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Investment Transaction</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this {transaction.type} transaction for {transaction.symbol}?
							This action cannot be undone. The holding will be updated accordingly.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{editOpen && (
				<AddInvestmentTransactionDialog
					accountId={transaction.accountId}
					holdings={holdings}
					initialData={{
						id: transaction.id,
						type: transaction.type,
						symbol: transaction.symbol,
						assetType: holdings.find((h) => h.symbol === transaction.symbol)?.assetType || 'STOCK',
						quantity: transaction.quantity,
						price: transaction.price,
						date: typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date,
						currency: transaction.currency,
						holdingId: transaction.holdingId || undefined,
					}}
					onSuccess={() => {
						setEditOpen(false)
						router.refresh()
					}}
				/>
			)}
		</>
	)
}

