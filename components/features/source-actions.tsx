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
import { SourceForm } from './source-form'
import { deleteSource } from '@/lib/actions/source'
import { useRouter } from 'next/navigation'

interface SourceActionsProps {
	source: {
		id: string
		name: string
		icon: string
	}
}

export function SourceActions({ source }: SourceActionsProps) {
	const [editOpen, setEditOpen] = useState(false)
	const [deleteOpen, setDeleteOpen] = useState(false)
	const router = useRouter()

	const handleDelete = async () => {
		const result = await deleteSource(source.id)
		if (result.success) {
			setDeleteOpen(false)
			router.refresh()
		} else {
			alert(result.error || 'Failed to delete source')
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
						<DialogTitle className="text-2xl font-semibold">Edit Source</DialogTitle>
						<DialogDescription className="text-base">
							Update source details
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6">
						<SourceForm
							initialData={source}
							onSuccess={() => setEditOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Delete Source</DialogTitle>
						<DialogDescription className="text-base">
							Are you sure you want to delete "{source.name}"? This action
							cannot be undone. Sources with transactions cannot be deleted.
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

