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
import { Plus, Briefcase, Youtube, Link2, DollarSign, Building2, Laptop, Smartphone, TrendingUp, Users, FileText } from 'lucide-react'
import { createSource, updateSource } from '@/lib/actions/source'
import { useRouter } from 'next/navigation'

const sourceSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	icon: z.string().min(1, 'Icon is required'),
})

type SourceFormValues = z.infer<typeof sourceSchema>

interface SourceFormProps {
	initialData?: {
		id?: string
		name?: string
		icon?: string
	}
	onSuccess?: () => void
}

const iconOptions = [
	{ value: 'Briefcase', label: 'Business', icon: Briefcase },
	{ value: 'Youtube', label: 'YouTube', icon: Youtube },
	{ value: 'Link2', label: 'Affiliate', icon: Link2 },
	{ value: 'DollarSign', label: 'Freelance', icon: DollarSign },
	{ value: 'Building2', label: 'Company', icon: Building2 },
	{ value: 'Laptop', label: 'Online', icon: Laptop },
	{ value: 'Smartphone', label: 'Mobile', icon: Smartphone },
	{ value: 'TrendingUp', label: 'Investment', icon: TrendingUp },
	{ value: 'Users', label: 'Partnership', icon: Users },
	{ value: 'FileText', label: 'Other', icon: FileText },
]

export function SourceForm({ initialData, onSuccess }: SourceFormProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id

	const form = useForm<SourceFormValues>({
		resolver: zodResolver(sourceSchema),
		defaultValues: {
			name: initialData?.name || '',
			icon: initialData?.icon || 'Briefcase',
		},
	})

	async function onSubmit(values: SourceFormValues) {
		setIsSubmitting(true)
		try {
			const result = isEdit && initialData?.id
				? await updateSource(initialData.id, values)
				: await createSource(values)

			if (result.success) {
				form.reset()
				if (!isEdit) {
					setOpen(false)
				}
				router.refresh()
				onSuccess?.()
			} else {
				form.setError('root', {
					message: result.error || `Failed to ${isEdit ? 'update' : 'create'} source`,
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
							<FormLabel className="text-sm font-medium">Source Name</FormLabel>
							<FormControl>
								<Input placeholder="e.g., YouTube, Freelance" className="h-11" {...field} />
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
						isEdit ? 'Update Source' : 'Create Source'
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
					Add Source
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader className="space-y-3 pb-6 border-b">
					<DialogTitle className="text-2xl font-semibold">Add Source</DialogTitle>
					<DialogDescription className="text-base">
						Create a custom source to track your income sources
					</DialogDescription>
				</DialogHeader>
				<div className="mt-6">
					{formContent}
				</div>
			</DialogContent>
		</Dialog>
	)
}

