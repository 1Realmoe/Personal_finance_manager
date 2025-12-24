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
import { CalendarIcon, Plus, Scan, Upload, X, Image as ImageIcon } from 'lucide-react'
import { createTransaction, updateTransaction } from '@/lib/actions/transaction'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { currencies, formatDateFull, DEFAULT_CURRENCY } from '@/lib/format'
import { createSource } from '@/lib/actions/source'
import { createCategory } from '@/lib/actions/category'
import { uploadReceiptImage } from '@/lib/actions/upload'
import * as LucideIcons from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ReceiptScanner } from './receipt-scanner'

const transactionSchema = z.object({
	amount: z.string().min(0.01, 'Amount must be greater than 0'),
	description: z.string().min(1, 'Description is required'),
	date: z.date(),
	accountId: z.string().min(1, 'Account is required'),
	toAccountId: z.string().optional(),
	categoryId: z.string().optional(),
	type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
	currency: z.string().min(1, 'Currency is required'),
	sourceId: z.string().optional(),
	isRecurrent: z.boolean(),
	recurrenceFrequency: z.enum(['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY']).optional(),
}).refine((data) => {
	// If isRecurrent is true, recurrenceFrequency must be provided
	if (data.isRecurrent && !data.recurrenceFrequency) {
		return false
	}
	return true
}, {
	message: 'Recurrence frequency is required for recurring transactions',
	path: ['recurrenceFrequency'],
}).refine((data) => {
	// If type is TRANSFER, toAccountId must be provided and different from accountId
	if (data.type === 'TRANSFER') {
		if (!data.toAccountId || data.toAccountId.trim() === '') {
			return false
		}
		if (data.accountId === data.toAccountId) {
			return false
		}
	}
	return true
}, {
	message: 'Destination account is required and must be different from source account',
	path: ['toAccountId'],
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
		additionalCurrencies?: Array<{ currency: string; balance: string }>
	}>
	categories: Array<{ id: string; name: string; icon?: string }>
	sources?: Array<{ id: string; name: string; icon: string }>
	onSuccess?: () => void
	initialData?: {
		id?: string
		amount?: string
		description?: string
		date?: Date
		accountId?: string
		toAccountId?: string | null
		categoryId?: string | null
		type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'
		currency?: string
		sourceId?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
		receiptImage?: string | null
	}
}

export function TransactionForm({
	accounts,
	categories: initialCategories = [],
	sources: initialSources = [],
	onSuccess,
	initialData,
}: TransactionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [createSourceOpen, setCreateSourceOpen] = useState(false)
	const [newSourceName, setNewSourceName] = useState('')
	const [isCreatingSource, setIsCreatingSource] = useState(false)
	const [sourceSelectOpen, setSourceSelectOpen] = useState(false)
	const [sources, setSources] = useState(initialSources)
	const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [isCreatingCategory, setIsCreatingCategory] = useState(false)
	const [categorySelectOpen, setCategorySelectOpen] = useState(false)
	const [categories, setCategories] = useState(initialCategories)
	const [receiptScannerOpen, setReceiptScannerOpen] = useState(false)
	const [receiptImage, setReceiptImage] = useState<string | null>(initialData?.receiptImage || null)
	const [isUploadingReceipt, setIsUploadingReceipt] = useState(false)
	const receiptInputRef = useRef<HTMLInputElement>(null)
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
			toAccountId: initialData?.toAccountId || '',
			categoryId: initialData?.categoryId || '',
			type: initialData?.type || 'EXPENSE',
			currency: getDefaultCurrencyValue(),
			sourceId: initialData?.sourceId || '',
			isRecurrent: initialData?.isRecurrent ?? false,
			recurrenceFrequency: initialData?.recurrenceFrequency || undefined,
		},
	})

	const transactionType = form.watch('type')
	const selectedAccountId = form.watch('accountId')
	const selectedToAccountId = form.watch('toAccountId')
	const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId)
	const selectedToAccount = accounts.find((acc) => acc.id === selectedToAccountId)
	
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
					toAccountId: values.type === 'TRANSFER' ? (values.toAccountId && values.toAccountId.trim() !== '' ? values.toAccountId : null) : null,
					categoryId: values.categoryId && values.categoryId.trim() !== '' ? values.categoryId : null,
					type: values.type,
					currency: values.currency,
					sourceId: values.sourceId && values.sourceId.trim() !== '' ? values.sourceId : null,
					isRecurrent: values.isRecurrent,
					recurrenceFrequency: values.recurrenceFrequency || null,
					receiptImage: receiptImage,
				})
				: await createTransaction({
				amount: values.amount,
				description: values.description,
				date: values.date,
				accountId: values.accountId,
				toAccountId: values.type === 'TRANSFER' ? (values.toAccountId && values.toAccountId.trim() !== '' ? values.toAccountId : null) : null,
				categoryId: values.categoryId && values.categoryId.trim() !== '' ? values.categoryId : null,
				type: values.type,
					currency: values.currency,
					sourceId: values.sourceId && values.sourceId.trim() !== '' ? values.sourceId : null,
					isRecurrent: values.isRecurrent,
					recurrenceFrequency: values.recurrenceFrequency || null,
					receiptImage: receiptImage,
			})

			if (result.success) {
				if (!isEdit) {
					form.reset()
					setReceiptImage(null) // Reset receipt image when creating new transaction
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

	const handleReceiptScan = (data: {
		amount?: string
		description?: string
		date?: Date
		currency?: string
		merchant?: string
		imageData?: string
	}) => {
		if (data.amount) {
			form.setValue('amount', data.amount)
		}
		if (data.description) {
			form.setValue('description', data.description)
		}
		if (data.date) {
			form.setValue('date', data.date)
		}
		if (data.currency) {
			form.setValue('currency', data.currency)
		}
		// Set type to EXPENSE by default for receipts
		form.setValue('type', 'EXPENSE')
		// Automatically attach the scanned image if available
		if (data.imageData) {
			setReceiptImage(data.imageData)
		}
		setReceiptScannerOpen(false)
	}

	const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Validate file type
		if (!file.type.startsWith('image/')) {
			form.setError('root', { message: 'Please select an image file' })
			return
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			form.setError('root', { message: 'File size must be less than 10MB' })
			return
		}

		setIsUploadingReceipt(true)
		try {
			const formData = new FormData()
			formData.append('file', file)
			const result = await uploadReceiptImage(formData)
			
			// Only upload the image - do NOT modify any form fields
			// Form fields are only modified when using "Scan Receipt" feature
			// Store base64 data URL in state (will be saved to database)
			if (result.success && result.imageData) {
				setReceiptImage(result.imageData)
			} else {
				form.setError('root', { message: result.error || 'Failed to upload receipt' })
			}
		} catch (error) {
			console.error('Error uploading receipt:', error)
			form.setError('root', { message: 'Failed to upload receipt' })
		} finally {
			setIsUploadingReceipt(false)
			if (receiptInputRef.current) {
				receiptInputRef.current.value = ''
			}
		}
	}

	const handleRemoveReceipt = () => {
		setReceiptImage(null)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{!isEdit && (
					<div className="flex justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => setReceiptScannerOpen(true)}
							className="gap-2"
						>
							<Scan className="h-4 w-4" />
							Scan Receipt
						</Button>
					</div>
				)}

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
									<SelectItem value="TRANSFER" className="cursor-pointer">
										<span className="flex items-center gap-2">
											<span className="h-2 w-2 rounded-full bg-blue-500"></span>
											Transfer
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
							<FormLabel className="text-sm font-medium">
								{transactionType === 'TRANSFER' ? 'From Account' : 'Account'}
							</FormLabel>
							<Select
								onValueChange={(value) => {
									field.onChange(value)
									// Set default currency when account changes (only if currency not already set)
									const account = accounts.find((acc) => acc.id === value)
									if (account && !form.getValues('currency')) {
										form.setValue('currency', account.currency || DEFAULT_CURRENCY)
									}
									// Clear toAccountId if it's the same as the selected account
									if (transactionType === 'TRANSFER' && form.getValues('toAccountId') === value) {
										form.setValue('toAccountId', '')
									}
								}}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder={transactionType === 'TRANSFER' ? 'Select source account' : 'Select account'} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{accounts
										.filter((account) => transactionType !== 'TRANSFER' || account.id !== selectedToAccountId)
										.map((account) => (
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

				{transactionType === 'TRANSFER' && (
					<FormField
						control={form.control}
						name="toAccountId"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">To Account</FormLabel>
								<Select
									onValueChange={(value) => {
										field.onChange(value)
										// Clear accountId if it's the same as the selected to account
										if (form.getValues('accountId') === value) {
											form.setValue('accountId', '')
										}
									}}
									value={field.value || ''}
								>
									<FormControl>
										<SelectTrigger className="h-11">
											<SelectValue placeholder="Select destination account" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{accounts
											.filter((account) => account.id !== selectedAccountId)
											.map((account) => (
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
								open={categorySelectOpen}
								onOpenChange={setCategorySelectOpen}
								onValueChange={(value) => {
									if (value === '__create_new__') {
										setCategorySelectOpen(false)
										setCreateCategoryOpen(true)
										// Don't update the field value for create option
									} else {
										field.onChange(value)
										setCategorySelectOpen(false)
									}
								}}
								value={field.value || ''}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select or create category" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{categories.length > 0 ? (
										categories.map((category) => {
											const IconComponent = (LucideIcons as any)[category.icon || 'Tag'] || LucideIcons.Tag
											return (
												<SelectItem key={category.id} value={category.id} className="cursor-pointer">
													<div className="flex items-center gap-2">
														<IconComponent className="h-4 w-4" />
														{category.name}
													</div>
												</SelectItem>
											)
										})
									) : (
										<div className="px-2 py-1.5 text-sm text-muted-foreground">
											No categories available
										</div>
									)}
									<SelectItem 
										value="__create_new__" 
										className="cursor-pointer text-primary font-medium border-t"
									>
										<div className="flex items-center gap-2">
											<Plus className="h-4 w-4" />
											Create new category
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{transactionType === 'INCOME' && (
					<FormField
						control={form.control}
						name="sourceId"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">Source (Optional)</FormLabel>
								<Select
									open={sourceSelectOpen}
									onOpenChange={setSourceSelectOpen}
									onValueChange={(value) => {
										if (value === '__create_new__') {
											setSourceSelectOpen(false)
											setCreateSourceOpen(true)
											// Don't update the field value for create option
										} else {
											field.onChange(value)
											setSourceSelectOpen(false)
										}
									}}
									value={field.value || ''}
								>
									<FormControl>
										<SelectTrigger className="h-11">
											<SelectValue placeholder="Select or create source" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{sources.length > 0 ? (
											sources.map((source) => {
												const IconComponent = (LucideIcons as any)[source.icon] || LucideIcons.Briefcase
												return (
													<SelectItem key={source.id} value={source.id} className="cursor-pointer">
														<div className="flex items-center gap-2">
															<IconComponent className="h-4 w-4" />
															{source.name}
														</div>
													</SelectItem>
												)
											})
										) : (
											<div className="px-2 py-1.5 text-sm text-muted-foreground">
												No sources available
											</div>
										)}
										<SelectItem 
											value="__create_new__" 
											className="cursor-pointer text-primary font-medium border-t"
										>
											<div className="flex items-center gap-2">
												<Plus className="h-4 w-4" />
												Create new source
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Create Source Dialog */}
				<Dialog open={createSourceOpen} onOpenChange={setCreateSourceOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader className="space-y-3 pb-6 border-b">
							<DialogTitle className="text-2xl font-semibold">Create Source</DialogTitle>
							<DialogDescription className="text-base">
								Create a new income source
							</DialogDescription>
						</DialogHeader>
						<div className="mt-6 space-y-4">
							<div>
								<label className="text-sm font-medium mb-2 block">Source Name</label>
								<Input
									placeholder="e.g., YouTube, Freelance"
									value={newSourceName}
									onChange={(e) => setNewSourceName(e.target.value)}
									className="h-11"
								/>
							</div>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
									onClick={() => {
										setCreateSourceOpen(false)
										setNewSourceName('')
									}}
									className="h-10"
								>
									Cancel
								</Button>
								<Button
									onClick={async () => {
										if (!newSourceName.trim()) return
										setIsCreatingSource(true)
										try {
											const result = await createSource({
												name: newSourceName.trim(),
												icon: 'Briefcase',
											})
											if (result.success && result.source) {
												// Add new source to local state immediately
												setSources((prev) => [...prev, result.source!])
												form.setValue('sourceId', result.source.id)
												setCreateSourceOpen(false)
												setNewSourceName('')
												router.refresh()
											} else {
												alert(result.error || 'Failed to create source')
											}
										} catch (error) {
											console.error('Error creating source:', error)
										} finally {
											setIsCreatingSource(false)
										}
									}}
									disabled={!newSourceName.trim() || isCreatingSource}
									className="h-10"
								>
									{isCreatingSource ? 'Creating...' : 'Create'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Create Category Dialog */}
				<Dialog open={createCategoryOpen} onOpenChange={setCreateCategoryOpen}>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader className="space-y-3 pb-6 border-b">
							<DialogTitle className="text-2xl font-semibold">Create Category</DialogTitle>
							<DialogDescription className="text-base">
								Create a new expense category
							</DialogDescription>
						</DialogHeader>
						<div className="mt-6 space-y-4">
							<div>
								<label className="text-sm font-medium mb-2 block">Category Name</label>
								<Input
									placeholder="e.g., Groceries, Rent, Utilities"
									value={newCategoryName}
									onChange={(e) => setNewCategoryName(e.target.value)}
									className="h-11"
								/>
							</div>
							<div className="flex justify-end gap-3">
								<Button
									variant="outline"
									onClick={() => {
										setCreateCategoryOpen(false)
										setNewCategoryName('')
									}}
									className="h-10"
								>
									Cancel
								</Button>
								<Button
									onClick={async () => {
										if (!newCategoryName.trim()) return
										setIsCreatingCategory(true)
										try {
											const result = await createCategory({
												name: newCategoryName.trim(),
												icon: 'Tag',
											})
											if (result.success && result.category) {
												// Add new category to local state immediately
												setCategories((prev) => [...prev, result.category!])
												form.setValue('categoryId', result.category.id)
												setCreateCategoryOpen(false)
												setNewCategoryName('')
												router.refresh()
											} else {
												alert(result.error || 'Failed to create category')
											}
										} catch (error) {
											console.error('Error creating category:', error)
										} finally {
											setIsCreatingCategory(false)
										}
									}}
									disabled={!newCategoryName.trim() || isCreatingCategory}
									className="h-10"
								>
									{isCreatingCategory ? 'Creating...' : 'Create'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{transactionType === 'TRANSFER' && (
					<div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
						<p className="text-sm text-muted-foreground">
							Transferring money between your accounts. The amount will be deducted from the source account and added to the destination account.
						</p>
					</div>
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

				{form.watch('isRecurrent') && (
					<FormField
						control={form.control}
						name="recurrenceFrequency"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium">Recurrence Frequency</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
								>
									<FormControl>
										<SelectTrigger className="h-11">
											<SelectValue placeholder="Select frequency" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="DAILY" className="cursor-pointer">
											Daily
										</SelectItem>
										<SelectItem value="WEEKLY" className="cursor-pointer">
											Weekly
										</SelectItem>
										<SelectItem value="MONTHLY" className="cursor-pointer">
											Monthly
										</SelectItem>
										<SelectItem value="YEARLY" className="cursor-pointer">
											Yearly
										</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				{/* Receipt Attachment */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Receipt (Optional)</label>
					<input
						ref={receiptInputRef}
						type="file"
						accept="image/*"
						onChange={handleReceiptUpload}
						className="hidden"
					/>
					{receiptImage ? (
						<div className="space-y-2">
							<div className="relative rounded-lg border border-border overflow-hidden bg-muted/50">
								<img
									src={receiptImage}
									alt="Receipt"
									className="w-full h-auto max-h-48 object-contain"
								/>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={handleRemoveReceipt}
								disabled={isUploadingReceipt}
								className="w-full"
							>
								<X className="mr-2 h-4 w-4" />
								Remove Receipt
							</Button>
						</div>
					) : (
						<Button
							type="button"
							variant="outline"
							onClick={() => receiptInputRef.current?.click()}
							disabled={isUploadingReceipt || isSubmitting}
							className="w-full"
						>
							{isUploadingReceipt ? (
								<>
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
									Uploading...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Attach Receipt
								</>
							)}
						</Button>
					)}
				</div>

				{form.formState.errors.root && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
						<p className="text-sm text-destructive font-medium">
							{form.formState.errors.root.message}
						</p>
					</div>
				)}

				<Button 
					type="submit" 
					disabled={isSubmitting || isUploadingReceipt} 
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

			{/* Receipt Scanner Dialog */}
			<Dialog open={receiptScannerOpen} onOpenChange={setReceiptScannerOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader className="space-y-3 pb-6 border-b">
						<DialogTitle className="text-2xl font-semibold">Scan Receipt</DialogTitle>
						<DialogDescription className="text-base">
							Upload a receipt image to automatically extract transaction details
						</DialogDescription>
					</DialogHeader>
					<div className="mt-6">
						<ReceiptScanner
							onScanComplete={handleReceiptScan}
							onClose={() => setReceiptScannerOpen(false)}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</Form>
	)
}

