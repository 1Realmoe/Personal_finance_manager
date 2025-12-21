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
import { GoalForm } from './goal-form'
import { deleteGoal } from '@/lib/actions/goal'
import { useRouter } from 'next/navigation'

interface GoalActionsProps {
	goal: {
		id: string
		title: string
		description?: string | null
		targetAmount: string
		currentAmount: string
		currency: string
		targetDate?: Date | null
		accountId?: string | null
	}
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
	}>
}

export function GoalActions({ goal, accounts }: GoalActionsProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		const result = await deleteGoal(goal.id)
		if (result.success) {
			setDeleteOpen(false)
			router.refresh()
		} else {
			alert(result.error || 'Failed to delete goal')
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

			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Edit Goal</DialogTitle>
						<DialogDescription className="text-base">
							Update goal details
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6">
						<GoalForm
							accounts={accounts}
							initialData={goal}
							onSuccess={() => setEditOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Goal</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{goal.title}"? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="h-10">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

