'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const iconEntitySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	icon: z.string().min(1, 'Icon is required'),
})

type IconEntityFormValues = z.infer<typeof iconEntitySchema>

interface IconOption {
	value: string
	label: string
	icon: LucideIcon
}

interface IconEntityFormProps {
	entityType: 'category' | 'source'
	entityName: string // "Category" or "Source"
	iconOptions: IconOption[]
	defaultIcon: string
	nameLabel: string // "Category Name" or "Source Name"
	namePlaceholder: string // "e.g., Groceries" or "e.g., YouTube, Freelance"
	createAction: (values: { name: string; icon: string }) => Promise<{ success: boolean; error?: string }>
	updateAction: (id: string, values: { name: string; icon: string }) => Promise<{ success: boolean; error?: string }>
	initialData?: {
		id?: string
		name?: string
		icon?: string
	}
	onSuccess?: () => void
}

export function IconEntityForm({
	entityType,
	entityName,
	iconOptions,
	defaultIcon,
	nameLabel,
	namePlaceholder,
	createAction,
	updateAction,
	initialData,
	onSuccess,
}: IconEntityFormProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id

	const form = useForm<IconEntityFormValues>({
		resolver: zodResolver(iconEntitySchema),
		defaultValues: {
			name: initialData?.name || '',
			icon: initialData?.icon || defaultIcon,
		},
	})

	async function onSubmit(values: IconEntityFormValues) {
		setIsSubmitting(true)
		try {
			const result = isEdit && initialData?.id
				? await updateAction(initialData.id, values)
				: await createAction(values)

			if (result.success) {
				form.reset()
				if (!isEdit) {
					setOpen(false)
				}
				router.refresh()
				onSuccess?.()
			} else {
				form.setError('root', {
					message: result.error || `Failed to ${isEdit ? 'update' : 'create'} ${entityName.toLowerCase()}`,
				})
			}
		} catch (error) {
			form.setError('root', {
				message: 'An unexpected error occurred',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const formContent = (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">{nameLabel}</FormLabel>
							<FormControl>
								<Input placeholder={namePlaceholder} className="h-11" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="icon"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Icon</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select icon" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{iconOptions.map((icon) => {
										const IconComponent = icon.icon
										return (
											<SelectItem key={icon.value} value={icon.value} className="cursor-pointer">
												<div className="flex items-center gap-2">
													<IconComponent className="h-4 w-4" />
													{icon.label}
												</div>
											</SelectItem>
										)
									})}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{form.formState.errors.root && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
						<p className="text-sm text-destructive font-medium">
							{form.formState.errors.root.message}
						</p>
					</div>
				)}

				<Button 
					type="submit" 
					disabled={isSubmitting} 
					className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 font-medium"
				>
					{isSubmitting ? (
						<span className="flex items-center gap-2">
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
							{isEdit ? 'Updating...' : 'Creating...'}
						</span>
					) : (
						isEdit ? `Update ${entityName}` : `Create ${entityName}`
					)}
				</Button>
			</form>
		</Form>
	)

	if (isEdit) {
		return formContent
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200">
					<Plus className="mr-2 h-4 w-4" />
					Add {entityName}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader className="space-y-3 pb-6 border-b">
					<DialogTitle className="text-2xl font-semibold">Add {entityName}</DialogTitle>
					<DialogDescription className="text-base">
						Create a custom {entityName.toLowerCase()} to {entityType === 'category' ? 'organize your transactions' : 'track your income sources'}
					</DialogDescription>
				</DialogHeader>
				<div className="mt-6">
					{formContent}
				</div>
			</DialogContent>
		</Dialog>
	)
}

