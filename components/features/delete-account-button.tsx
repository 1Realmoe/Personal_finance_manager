'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteAccount } from '@/lib/actions/settings'

export function DeleteAccountButton() {
	const [isDeleting, setIsDeleting] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await deleteAccount()
			router.push('/signin')
		} catch (error) {
			console.error('Error deleting account:', error)
			alert('Failed to delete account. Please try again.')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete Account'}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account
						and remove all your data from our servers. All your transactions, accounts,
						categories, and goals will be deleted.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isDeleting}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isDeleting ? 'Deleting...' : 'Delete Account'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

