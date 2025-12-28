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
} from '@/components/ui/dialog'
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
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EntityActionsProps<T> {
	entity: T
	entityName: string
	onEdit?: (entity: T) => void
	onDelete: (entity: T) => Promise<{ success: boolean; error?: string }>
	deleteMessage?: string
	deleteWarning?: string
	editForm?: React.ReactNode | ((onClose: () => void) => React.ReactNode)
	className?: string
}

export function EntityActions<T extends { id: string; name?: string; title?: string }>({
	entity,
	entityName,
	onEdit,
	onDelete,
	deleteMessage,
	deleteWarning,
	editForm,
	className,
}: EntityActionsProps<T>) {
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const router = useRouter()

	const displayName = entity.name || entity.title || entityName
	const defaultDeleteMessage = `Are you sure you want to delete "${displayName}"? This action cannot be undone.`
	const defaultDeleteWarning = deleteWarning || 'This action cannot be undone.'

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			const result = await onDelete(entity)
			if (result.success) {
				toast.success(`${entityName} deleted successfully`)
				setDeleteOpen(false)
				router.refresh()
			} else {
				toast.error(result.error || `Failed to delete ${entityName.toLowerCase()}`)
			}
		} catch (error) {
			toast.error(`An unexpected error occurred`)
		} finally {
			setIsDeleting(false)
		}
	}

	const handleEditClick = () => {
		if (onEdit) {
			onEdit(entity)
		} else if (editForm) {
			setEditOpen(true)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button 
						variant="ghost" 
						size="icon" 
						className={`h-8 w-8 hover:bg-accent transition-colors ${className || ''}`}
					>
						<MoreVertical className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					{(onEdit || editForm) && (
						<DropdownMenuItem 
							onClick={handleEditClick}
							className="cursor-pointer focus:bg-accent"
						>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
					)}
					<DropdownMenuItem
						onClick={() => setDeleteOpen(true)}
						className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{editForm && (
				<Dialog open={editOpen} onOpenChange={setEditOpen}>
					<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
						<DialogHeader className="space-y-3 pb-6 border-b">
							<DialogTitle className="text-2xl font-semibold">Edit {entityName}</DialogTitle>
							<DialogDescription className="text-base">
								Update {entityName.toLowerCase()} details
							</DialogDescription>
						</DialogHeader>
						<div className="mt-6">
							{typeof editForm === 'function' ? editForm(() => setEditOpen(false)) : editForm}
						</div>
					</DialogContent>
				</Dialog>
			)}

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {entityName}</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteMessage || defaultDeleteMessage}
							{deleteWarning && (
								<>
									<br />
									<br />
									<span className="font-medium">{deleteWarning}</span>
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting} className="h-10">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10"
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

