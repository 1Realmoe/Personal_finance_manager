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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { MoreVertical, Trash2, Edit } from 'lucide-react'
import { deleteTransaction } from '@/lib/actions/transaction'
import { useRouter } from 'next/navigation'
import { TransactionForm } from './transaction-form'

interface TransactionActionsProps {
	transactionId: string
	transaction: {
		id: string
		amount: string
		description: string
		date: Date | string
		accountId: string
		toAccountId?: string | null
		categoryId?: string | null
		type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
		currency?: string
		sourceId?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
		receiptImage?: string | null
	}
	accounts: Array<{ id: string; name: string; currency?: string }>
	categories: Array<{ id: string; name: string }>
	sources?: Array<{ id: string; name: string; icon: string }>
}

export function TransactionActions({ 
	transactionId, 
	transaction,
	accounts,
	categories,
	sources = [],
}: TransactionActionsProps) {
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			const result = await deleteTransaction(transactionId)
			if (result.success) {
				setDeleteOpen(false)
				router.refresh()
			} else {
				alert(result.error || 'Failed to delete transaction')
			}
		} catch (error) {
			alert('An unexpected error occurred')
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
						<AlertDialogTitle>Delete Transaction</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this transaction? This action
							cannot be undone. The account balance will be updated accordingly.
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

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Edit Transaction</DialogTitle>
						<DialogDescription className="text-base">
							Update transaction details
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6">
						<TransactionForm
							accounts={accounts}
							categories={categories}
							sources={sources}
							initialData={{
							id: transaction.id,
							amount: transaction.amount,
							description: transaction.description,
							date: typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date,
							accountId: transaction.accountId,
							toAccountId: transaction.toAccountId || null,
							categoryId: transaction.categoryId,
							type: transaction.type,
							currency: transaction.currency,
							sourceId: transaction.sourceId || null,
							isRecurrent: transaction.isRecurrent || false,
							recurrenceFrequency: transaction.recurrenceFrequency || null,
							receiptImage: transaction.receiptImage || null,
						}}
							onSuccess={() => {
								setEditOpen(false)
								router.refresh()
							}}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

