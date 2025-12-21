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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { currencies, type CurrencyCode } from '@/lib/currency'
import { Plus, X, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'

const accountCurrencySchema = z.object({
	currency: z.string().min(1, 'Currency is required'),
	balance: z.string().min(0, 'Balance must be 0 or greater'),
})

const accountSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['CURRENT', 'SAVINGS', 'CASH']),
	balance: z.string().min(0, 'Balance must be 0 or greater'),
	color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
	currency: z.string().min(1, 'Currency is required'),
	currencies: z.array(accountCurrencySchema).optional(),
	cardImage: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountSchema>

interface AccountFormProps {
	onSuccess?: () => void
	initialData?: {
		id?: string
		name?: string
		type?: 'CURRENT' | 'SAVINGS' | 'CASH'
		balance?: string
		color?: string
		currency?: string
		currencies?: Array<{ currency: string; balance: string }>
		cardImage?: string
	}
	onSubmit: (values: AccountFormValues) => Promise<{ success: boolean; error?: string }>
}

const cardImageOptions = [
	{ label: 'None (Default)', value: '' },
	{ label: 'Swedbank', value: '/swedbank.jpg' },
	{ label: 'Revolut', value: '/revolut.avif' },
	{ label: 'Revolut Pro', value: '/revolut-pro.png' },
]

const colorOptions = [
	{ label: 'Blue', value: '#3B82F6' },
	{ label: 'Green', value: '#10B981' },
	{ label: 'Purple', value: '#8B5CF6' },
	{ label: 'Pink', value: '#EC4899' },
	{ label: 'Orange', value: '#F59E0B' },
	{ label: 'Red', value: '#EF4444' },
	{ label: 'Teal', value: '#14B8A6' },
	{ label: 'Indigo', value: '#6366F1' },
]

export function AccountForm({
	onSuccess,
	initialData,
	onSubmit: onSubmitAction,
}: AccountFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id

	// Format balance to remove trailing zeros and commas
	const formatBalanceForInput = (balance: string | undefined): string => {
		if (!balance) return '0'
		const num = parseFloat(balance)
		if (isNaN(num)) return '0'
		// Remove trailing zeros and unnecessary decimals
		return num.toString()
	}

	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			name: initialData?.name || '',
			type: initialData?.type || 'CURRENT',
			balance: formatBalanceForInput(initialData?.balance),
			color: initialData?.color || '#3B82F6',
			currency: initialData?.currency || 'USD',
			currencies: initialData?.currencies || [],
			cardImage: initialData?.cardImage || '',
		},
	})

	const { fields, append, remove, move } = useFieldArray({
		control: form.control,
		name: 'currencies',
	})

	// Get all currencies including primary
	const getAllCurrencies = () => {
		const primary = { currency: form.watch('currency'), balance: form.watch('balance') }
		const additional = form.watch('currencies') || []
		return [primary, ...(Array.isArray(additional) ? additional : [])]
	}

	// Move currency to main position (index 0)
	const setAsMain = (index: number) => {
		const allCurrs = getAllCurrencies()
		if (index === 0) return // Already main

		const targetCurrency = allCurrs[index]
		
		// Update primary currency
		form.setValue('currency', targetCurrency.currency)
		form.setValue('balance', targetCurrency.balance)

		// Remove from additional currencies if it was there
		if (index > 0) {
			const currentCurrencies = form.getValues('currencies') || []
			const newAdditional = [...currentCurrencies]
			newAdditional.splice(index - 1, 1)
			
			// Add old primary to additional
			newAdditional.push({ currency: allCurrs[0].currency, balance: allCurrs[0].balance })
			form.setValue('currencies', newAdditional)
		}
	}

	async function onSubmit(values: AccountFormValues) {
		setIsSubmitting(true)
		try {
			const result = await onSubmitAction(values)

			if (result.success) {
				form.reset()
				router.refresh()
				onSuccess?.()
			} else {
				form.setError('root', {
					message: result.error || 'Failed to save account',
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
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Account Name</FormLabel>
							<FormControl>
								<Input placeholder="e.g., Chase Checking" className="h-11" {...field} />
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
							<FormLabel className="text-sm font-medium">Account Type</FormLabel>
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
									<SelectItem value="CURRENT" className="cursor-pointer">Current</SelectItem>
									<SelectItem value="SAVINGS" className="cursor-pointer">Savings</SelectItem>
									<SelectItem value="CASH" className="cursor-pointer">Cash</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Currencies (First one is main)</label>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								const primaryCurrency = form.watch('currency')
								const availableCurrencies = currencies.filter((c) => c.code !== primaryCurrency)
								if (availableCurrencies.length > 0) {
									append({ currency: availableCurrencies[0].code, balance: '0' })
								}
							}}
							className="h-9"
						>
							<Plus className="mr-2 h-4 w-4" />
							Add Currency
						</Button>
					</div>

					{/* Main Currency */}
					<div className="flex gap-3 items-start p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
						<div className="flex items-center gap-2 pt-6">
							<Star className="h-4 w-4 fill-primary text-primary" />
							<span className="text-xs font-medium text-primary">Main</span>
						</div>
						<FormField
							control={form.control}
							name="currency"
							render={({ field }) => (
								<FormItem className="flex-1 space-y-2">
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
							name="balance"
							render={({ field }) => (
								<FormItem className="flex-1 space-y-2">
									<FormLabel className="text-sm font-medium">
										{isEdit ? 'Balance' : 'Initial Balance'}
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

						<div className="flex items-end h-11 pt-6">
							<div className="h-11 w-11" /> {/* Spacer for alignment */}
						</div>
					</div>

					{/* Additional Currencies */}
					{fields.map((field, index) => {
						const primaryCurrency = form.watch('currency')
						const currenciesList = form.watch('currencies') || []
						const allCurrenciesUsed = [primaryCurrency, ...currenciesList.map((c: { currency: string }) => c.currency)]
						const availableCurrencies = currencies.filter((c) => !allCurrenciesUsed.includes(c.code))

						return (
							<div key={field.id} className="flex gap-3 items-start p-4 border rounded-lg">
								<div className="flex flex-col gap-1 pt-6">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setAsMain(index + 1)}
										className="h-8 w-8"
										title="Set as main currency"
									>
										<Star className="h-4 w-4 text-muted-foreground hover:text-primary" />
									</Button>
									{index > 0 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => move(index, index - 1)}
											className="h-8 w-8"
											title="Move up"
										>
											<ArrowUp className="h-4 w-4" />
										</Button>
									)}
									{index < fields.length - 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => move(index, index + 1)}
											className="h-8 w-8"
											title="Move down"
										>
											<ArrowDown className="h-4 w-4" />
										</Button>
									)}
								</div>

								<FormField
									control={form.control}
									name={`currencies.${index}.currency`}
									render={({ field }) => (
										<FormItem className="flex-1 space-y-2">
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
													{availableCurrencies.map((currency) => (
														<SelectItem key={currency.code} value={currency.code} className="cursor-pointer">
															{currency.code} - {currency.name}
														</SelectItem>
													))}
													{/* Allow selecting already used currencies for flexibility */}
													{currencies.filter((c) => allCurrenciesUsed.includes(c.code) && c.code === field.value).map((currency) => (
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
									name={`currencies.${index}.balance`}
									render={({ field }) => (
										<FormItem className="flex-1 space-y-2">
											<FormLabel className="text-sm font-medium">
												{isEdit ? 'Balance' : 'Initial Balance'}
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

								<div className="flex items-end h-11 pt-6">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => remove(index)}
										className="h-11 w-11 text-destructive hover:text-destructive"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)
					})}
				</div>

				<FormField
					control={form.control}
					name="color"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Color</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select color" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{colorOptions.map((color) => (
										<SelectItem key={color.value} value={color.value} className="cursor-pointer">
											<div className="flex items-center gap-2">
												<div
													className="h-4 w-4 rounded-full border border-border"
													style={{ backgroundColor: color.value }}
												/>
												{color.label}
											</div>
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
					name="cardImage"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium">Card Background Image (Optional)</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value || ''}
							>
								<FormControl>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Select card image" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{cardImageOptions.map((option) => (
										<SelectItem key={option.value} value={option.value} className="cursor-pointer">
											{option.label}
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
						isEdit ? 'Update Account' : 'Create Account'
					)}
				</Button>
			</form>
		</Form>
	)
}

