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
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { CalendarIcon, Plus } from 'lucide-react'
import { createGoal, updateGoal } from '@/lib/actions/goal'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { currencies } from '@/lib/currency'

const goalSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	targetAmount: z.string().min(0.01, 'Target amount must be greater than 0'),
	currentAmount: z.string().optional(),
	currency: z.string().min(1, 'Currency is required'),
	targetDate: z.date().optional().nullable(),
	accountId: z.string().optional(),
})

type GoalFormValues = z.infer<typeof goalSchema>

interface GoalFormProps {
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
	}>
	onSuccess?: () => void
	initialData?: {
		id?: string
		title?: string
		description?: string | null
		targetAmount?: string
		currentAmount?: string
		currency?: string
		targetDate?: Date | null
		accountId?: string | null
	}
}

export function GoalForm({
	accounts,
	onSuccess,
	initialData,
}: GoalFormProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id

	const form = useForm<GoalFormValues>({
		resolver: zodResolver(goalSchema),
		defaultValues: {
			title: initialData?.title || '',
			description: initialData?.description || '',
			targetAmount: initialData?.targetAmount || '',
			currentAmount: initialData?.currentAmount || '0',
			currency: initialData?.currency || accounts[0]?.currency || 'USD',
			targetDate: initialData?.targetDate ? new Date(initialData.targetDate) : null,
			accountId: initialData?.accountId || '',
		},
	})

	async function onSubmit(values: GoalFormValues) {
		setIsSubmitting(true)
		try {
			const result = isEdit && initialData?.id
				? await updateGoal(initialData.id, {
					title: values.title,
					description: values.description && values.description.trim() !== '' ? values.description : null,
					targetAmount: values.targetAmount,
					currentAmount: values.currentAmount || '0',
					currency: values.currency,
					targetDate: values.targetDate || null,
					accountId: values.accountId && values.accountId.trim() !== '' ? values.accountId : null,
				})
				: await createGoal({
					title: values.title,
					description: values.description && values.description.trim() !== '' ? values.description : null,
					targetAmount: values.targetAmount,
					currentAmount: values.currentAmount || '0',
					currency: values.currency,
					targetDate: values.targetDate || null,
					accountId: values.accountId && values.accountId.trim() !== '' ? values.accountId : null,
				})

			if (result.success) {
				if (!isEdit) {
					form.reset()
					setOpen(false)
				}
				router.refresh()
				onSuccess?.()
			} else {
				form.setError('root', {
					message: result.error || `Failed to ${isEdit ? 'update' : 'create'} goal`,
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
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Goal Title</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Emergency Fund, Vacation, House Down Payment"
									className="h-11"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
							<FormControl>
								<Input
									placeholder="Add a description for your goal"
									className="h-11"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="targetAmount"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Target Amount</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									className="h-11"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isEdit && (
					<FormField
						control={form.control}
						name="currentAmount"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">Current Amount</FormLabel>
								<FormControl>
									<Input
										type="number"
										step="0.01"
										placeholder="0.00"
										className="h-11"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="currency"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Currency</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{currencies.map((currency) => (
										<SelectItem key={currency.code} value={currency.code} className="cursor-pointer">
											{currency.code} - {currency.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="targetDate"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel className="text-sm font-medium">Target Date (Optional)</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											data-empty={!field.value}
											className={cn(
												'h-11 w-full justify-start text-left font-normal',
												'data-[empty=true]:text-muted-foreground'
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{field.value ? (
												format(field.value, 'PPP')
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value || undefined}
										onSelect={field.onChange}
										disabled={(date) => date < new Date('1900-01-01')}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="accountId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Linked Account (Optional)</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value || ''}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select account" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="" className="cursor-pointer">
										None
									</SelectItem>
									{accounts.map((account) => (
										<SelectItem key={account.id} value={account.id} className="cursor-pointer">
											{account.name}
										</SelectItem>
									))}
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
						isEdit ? 'Update Goal' : 'Create Goal'
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
					Add Goal
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader className="space-y-3 pb-6 border-b">
					<DialogTitle className="text-2xl font-semibold">Add Goal</DialogTitle>
					<DialogDescription className="text-base">
						Create a new financial goal to track your progress
					</DialogDescription>
				</DialogHeader>
				<div className="mt-6">
					{formContent}
				</div>
			</DialogContent>
		</Dialog>
	)
}

