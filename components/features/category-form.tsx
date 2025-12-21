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
import { Plus, Tag, Home, Utensils, DollarSign, ShoppingCart, Car, Heart, Gamepad2, Coffee, Plane, GraduationCap } from 'lucide-react'
import { createCategory, updateCategory } from '@/lib/actions/category'
import { useRouter } from 'next/navigation'

const categorySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['INCOME', 'EXPENSE']),
	icon: z.string().min(1, 'Icon is required'),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
	initialData?: {
		id?: string
		name?: string
		type?: 'INCOME' | 'EXPENSE'
		icon?: string
	}
	onSuccess?: () => void
}

const iconOptions = [
	{ value: 'Home', label: 'Home', icon: Home },
	{ value: 'Utensils', label: 'Food', icon: Utensils },
	{ value: 'DollarSign', label: 'Money', icon: DollarSign },
	{ value: 'ShoppingCart', label: 'Shopping', icon: ShoppingCart },
	{ value: 'Car', label: 'Transport', icon: Car },
	{ value: 'Heart', label: 'Health', icon: Heart },
	{ value: 'Gamepad2', label: 'Entertainment', icon: Gamepad2 },
	{ value: 'Coffee', label: 'Coffee', icon: Coffee },
	{ value: 'Plane', label: 'Travel', icon: Plane },
	{ value: 'GraduationCap', label: 'Education', icon: GraduationCap },
	{ value: 'Tag', label: 'Other', icon: Tag },
]

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
	const [open, setOpen] = useState(!initialData)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id

	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: initialData?.name || '',
			type: initialData?.type || 'EXPENSE',
			icon: initialData?.icon || 'Tag',
		},
	})

	async function onSubmit(values: CategoryFormValues) {
		setIsSubmitting(true)
		try {
			const result = isEdit && initialData?.id
				? await updateCategory(initialData.id, values)
				: await createCategory(values)

			if (result.success) {
				form.reset()
				if (!isEdit) {
					setOpen(false)
				}
				router.refresh()
				onSuccess?.()
			} else {
				form.setError('root', {
					message: result.error || `Failed to ${isEdit ? 'update' : 'create'} category`,
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
										<FormLabel className="text-sm font-medium">Category Name</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Groceries" className="h-11" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger className="h-11">
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="INCOME" className="cursor-pointer">
													<span className="flex items-center gap-2">
														<span className="h-2 w-2 rounded-full bg-green-500"></span>
														Income
													</span>
												</SelectItem>
												<SelectItem value="EXPENSE" className="cursor-pointer">
													<span className="flex items-center gap-2">
														<span className="h-2 w-2 rounded-full bg-red-500"></span>
														Expense
													</span>
												</SelectItem>
											</SelectContent>
										</Select>
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
									isEdit ? 'Update Category' : 'Create Category'
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
					Add Category
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader className="space-y-3 pb-6 border-b">
					<DialogTitle className="text-2xl font-semibold">Add Category</DialogTitle>
					<DialogDescription className="text-base">
						Create a custom category to organize your transactions
					</DialogDescription>
				</DialogHeader>
				<div className="mt-6">
					{formContent}
				</div>
			</DialogContent>
		</Dialog>
	)
}

