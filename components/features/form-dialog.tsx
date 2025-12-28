'use client'

import { useState, ReactNode } from 'react'
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
import { useRouter } from 'next/navigation'

interface FormDialogProps {
	title: string
	description: string
	trigger?: ReactNode
	triggerLabel?: string
	children: ReactNode | ((onSuccess: () => void) => ReactNode)
	onSuccess?: () => void
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
	initialOpen?: boolean
	showInfoBox?: boolean
	infoBoxContent?: ReactNode
}

export function FormDialog({
	title,
	description,
	trigger,
	triggerLabel = 'Add',
	children,
	onSuccess,
	maxWidth = 'lg',
	initialOpen = false,
	showInfoBox = false,
	infoBoxContent,
}: FormDialogProps) {
	const [open, setOpen] = useState(initialOpen)
	const router = useRouter()

	const handleSuccess = () => {
		setOpen(false)
		onSuccess?.()
		router.refresh()
	}

	const maxWidthClasses = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		'2xl': 'max-w-2xl',
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{!initialOpen && (
				<DialogTrigger asChild>
					{trigger || (
						<Button variant="outline">
							<Plus className="mr-2 h-4 w-4" />
							{triggerLabel}
						</Button>
					)}
				</DialogTrigger>
			)}
			<DialogContent className={`${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto`}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{showInfoBox && infoBoxContent && (
					<div className="mb-4 p-3 bg-muted/50 rounded-lg border border-dashed">
						{infoBoxContent}
					</div>
				)}
				{typeof children === 'function' ? children(handleSuccess) : children}
			</DialogContent>
		</Dialog>
	)
}

