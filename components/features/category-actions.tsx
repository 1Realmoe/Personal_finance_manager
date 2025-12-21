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
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { CategoryForm } from './category-form'
import { deleteCategory } from '@/lib/actions/category'
import { useRouter } from 'next/navigation'

interface CategoryActionsProps {
	category: {
		id: string
		name: string
		type: 'INCOME' | 'EXPENSE'
		icon: string
	}
}

export function CategoryActions({ category }: CategoryActionsProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		const result = await deleteCategory(category.id)
		if (result.success) {
			setDeleteOpen(false)
			router.refresh()
		} else {
			alert(result.error || 'Failed to delete category')
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
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Edit Category</DialogTitle>
						<DialogDescription className="text-base">
							Update category details
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6">
						<CategoryForm
							initialData={category}
							onSuccess={() => setEditOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Delete Category</DialogTitle>
						<DialogDescription className="text-base">
							Are you sure you want to delete "{category.name}"? This action
							cannot be undone. Categories with transactions cannot be deleted.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-3 mt-6">
						<Button 
							variant="outline" 
							onClick={() => setDeleteOpen(false)}
							className="h-10"
						>
							Cancel
						</Button>
						<Button 
							variant="destructive" 
							onClick={handleDelete}
							className="h-10 shadow-sm hover:shadow-md transition-all duration-200"
						>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

