'use client'

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
import { CalendarIcon } from 'lucide-react'
import { createTransaction, updateTransaction } from '@/lib/actions/transaction'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getCurrencySymbol, currencies, formatDateFull, DEFAULT_CURRENCY } from '@/lib/format'

const transactionSchema = z.object({
	amount: z.string().min(0.01, 'Amount must be greater than 0'),
	description: z.string().min(1, 'Description is required'),
	date: z.date(),
	accountId: z.string().min(1, 'Account is required'),
	categoryId: z.string().optional(),
	type: z.enum(['INCOME', 'EXPENSE']),
	currency: z.string().min(1, 'Currency is required'),
	source: z.string().optional(),
	isRecurrent: z.boolean(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
		additionalCurrencies?: Array<{ currency: string; balance: string }>
	}>
	categories: Array<{ id: string; name: string }>
	onSuccess?: () => void
	initialData?: {
		id?: string
		amount?: string
		description?: string
		date?: Date
		accountId?: string
		categoryId?: string | null
		type?: 'INCOME' | 'EXPENSE'
		currency?: string
		source?: string | null
		isRecurrent?: boolean
	}
}

export function TransactionForm({
	accounts,
	categories,
	onSuccess,
	initialData,
}: TransactionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id

	// Determine default currency from initial data or first account
	const getDefaultCurrencyValue = () => {
		if (initialData?.currency) return initialData.currency
		if (initialData?.accountId) {
			const account = accounts.find((acc) => acc.id === initialData.accountId)
			return account?.currency || DEFAULT_CURRENCY
		}
		return accounts.length > 0 ? (accounts[0].currency || DEFAULT_CURRENCY) : DEFAULT_CURRENCY
	}

	const form = useForm<TransactionFormValues>({
		resolver: zodResolver(transactionSchema),
		defaultValues: {
			amount: initialData?.amount || '',
			description: initialData?.description || '',
			date: initialData?.date ? new Date(initialData.date) : new Date(),
			accountId: initialData?.accountId || '',
			categoryId: initialData?.categoryId || '',
			type: initialData?.type || 'EXPENSE',
			currency: getDefaultCurrencyValue(),
			source: initialData?.source || '',
			isRecurrent: initialData?.isRecurrent ?? false,
		},
	})

	const transactionType = form.watch('type')
	const selectedAccountId = form.watch('accountId')
	const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)
	
	// Get all available currencies for the selected account (primary + additional)
	const availableCurrencies = selectedAccount
		? [
				{ currency: selectedAccount.currency || DEFAULT_CURRENCY },
				...(selectedAccount.additionalCurrencies || []),
			]
		: currencies.map((c) => ({ currency: c.code }))
	
	// Categories are now universal - no filtering by type needed

	async function onSubmit(values: TransactionFormValues) {
		setIsSubmitting(true)
		try {
			const result = isEdit && initialData?.id
				? await updateTransaction(initialData.id, {
					amount: values.amount,
					description: values.description,
					date: values.date,
					accountId: values.accountId,
					categoryId: values.categoryId && values.categoryId.trim() !== '' ? values.categoryId : null,
					type: values.type,
					currency: values.currency,
					source: values.source && values.source.trim() !== '' ? values.source : null,
					isRecurrent: values.isRecurrent,
				})
				: await createTransaction({
				amount: values.amount,
				description: values.description,
				date: values.date,
				accountId: values.accountId,
				categoryId: values.categoryId && values.categoryId.trim() !== '' ? values.categoryId : null,
				type: values.type,
					currency: values.currency,
					source: values.source && values.source.trim() !== '' ? values.source : null,
					isRecurrent: values.isRecurrent,
			})

			if (result.success) {
				if (!isEdit) {
				form.reset()
				}
				router.refresh()
				onSuccess?.()
			} else {
				form.setError('root', {
					message: result.error || `Failed to ${isEdit ? 'update' : 'create'} transaction`,
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Transaction Type</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select transaction type" />
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
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">
								Amount
							</FormLabel>
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

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Description</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter description"
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
					name="date"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel className="text-sm font-medium">Date</FormLabel>
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
												formatDateFull(field.value)
											) : (
												<span>Pick a date</span>
											)}
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) =>
											date > new Date() || date < new Date('1900-01-01')
										}
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
							<FormLabel className="text-sm font-medium">Account</FormLabel>
							<Select
								onValueChange={(value) => {
									field.onChange(value)
									// Set default currency when account changes (only if currency not already set)
									const account = accounts.find((acc) => acc.id === value)
									if (account && !form.getValues('currency')) {
										form.setValue('currency', account.currency || DEFAULT_CURRENCY)
									}
								}}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select account" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
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
									{availableCurrencies.length > 0 ? (
										availableCurrencies.map((curr) => {
											const currencyInfo = currencies.find((c) => c.code === curr.currency)
											return (
												<SelectItem key={curr.currency} value={curr.currency} className="cursor-pointer">
													{curr.currency} - {currencyInfo?.name || curr.currency}
												</SelectItem>
											)
										})
									) : (
										currencies.map((currency) => (
											<SelectItem key={currency.code} value={currency.code} className="cursor-pointer">
												{currency.code} - {currency.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="categoryId"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Category (Optional)</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value || ''}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{categories.length > 0 ? (
										categories.map((category) => (
											<SelectItem key={category.id} value={category.id} className="cursor-pointer">
												{category.name}
											</SelectItem>
										))
									) : (
										<div className="px-2 py-1.5 text-sm text-muted-foreground">
											No categories available
										</div>
									)}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{transactionType === 'INCOME' && (
					<FormField
						control={form.control}
						name="source"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">Source (Optional)</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g., YouTube, Affiliate, Freelance"
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
					name="isRecurrent"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
							<FormControl>
								<input
									type="checkbox"
									checked={field.value}
									onChange={field.onChange}
									className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel className="text-sm font-medium cursor-pointer">
									Recurrent / Frequent Transaction
								</FormLabel>
								<p className="text-xs text-muted-foreground">
									Mark this transaction as recurring (e.g., monthly salary, subscription)
								</p>
							</div>
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
						isEdit ? 'Update Transaction' : 'Create Transaction'
					)}
				</Button>
			</form>
		</Form>
	)
}

