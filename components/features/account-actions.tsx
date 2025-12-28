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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { MoreVertical, Edit, Trash2, Plus } from 'lucide-react'
import { AccountForm } from './account-form'
import { createAccount, updateAccount, deleteAccount } from '@/lib/actions/account'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AccountActionsProps {
	account?: {
		id: string
		name: string
		type: 'CURRENT' | 'SAVINGS' | 'CASH' | 'INVESTMENT'
		color: string
		currency?: string
		additionalCurrencies?: Array<{ currency: string; balance: string }>
		cardImage?: string | null
	}
	defaultAccountType?: 'CURRENT' | 'SAVINGS' | 'CASH' | 'INVESTMENT'
}

export function AccountActions({ account, defaultAccountType }: AccountActionsProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [addOpen, setAddOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		if (!account) return

		setIsDeleting(true)
		try {
			const result = await deleteAccount(account.id)
			
			if (result?.success) {
				toast.success('Account deleted successfully')
				setDeleteOpen(false)
				router.refresh()
			} else {
				const errorMessage = result?.error || 'Failed to delete account'
				toast.error(errorMessage, {
					duration: 5000,
				})
			}
		} catch (error) {
			console.error('Error deleting account:', error)
			const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while deleting the account'
			toast.error(errorMessage, {
				duration: 5000,
			})
		} finally {
			setIsDeleting(false)
		}
	}

	if (!account) {
		// Add Account button
		return (
			<Dialog open={addOpen} onOpenChange={setAddOpen}>
				<DialogTrigger asChild>
					<Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
						<Plus className="mr-2 h-4 w-4" />
						Add Account
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Add Account</DialogTitle>
						<DialogDescription className="text-base">
							Create a new bank account to track your finances
						</DialogDescription>
					</DialogHeader>
					<div>
						<AccountForm
							initialData={defaultAccountType ? { type: defaultAccountType } : undefined}
							onSubmit={async (values) => createAccount(values)}
							onSuccess={() => {
								setAddOpen(false)
								router.refresh()
							}}
						/>
					</div>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
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

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="border-b">
						<DialogTitle className="text-2xl font-semibold">Edit Account</DialogTitle>
						<DialogDescription className="text-base">
							Update account details
						</DialogDescription>
					</DialogHeader>
					<div>
						<AccountForm
							initialData={{
								...account,
								currencies: account.additionalCurrencies || [],
								cardImage: account.cardImage || undefined,
							}}
							onSubmit={async (values) => updateAccount(account.id, values)}
							onSuccess={() => setEditOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={(open) => {
				if (!isDeleting) {
					setDeleteOpen(open)
				}
			}}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Delete Account</DialogTitle>
						<DialogDescription className="text-base">
							Are you sure you want to delete "{account.name}"? This action
							cannot be undone. Accounts with transactions cannot be deleted.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-3 mt-6">
						<Button 
							variant="outline" 
							onClick={() => setDeleteOpen(false)}
							disabled={isDeleting}
							className="h-10"
						>
							Cancel
						</Button>
						<Button 
							variant="destructive" 
							onClick={handleDelete}
							disabled={isDeleting}
							className="h-10 shadow-sm hover:shadow-md transition-all duration-200"
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

