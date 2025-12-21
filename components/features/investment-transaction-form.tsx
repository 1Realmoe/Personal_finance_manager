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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { createInvestmentTransaction, updateInvestmentTransaction } from '@/lib/actions/investment'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDateFull, currencies, DEFAULT_CURRENCY } from '@/lib/format'
import { formatCurrency } from '@/lib/currency'

const investmentTransactionSchema = z.object({
	type: z.enum(['BUY', 'SELL']),
	symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
	assetType: z.enum(['STOCK', 'CRYPTO']),
	quantity: z.string().min(0.00000001, 'Quantity must be greater than 0'),
	price: z.string().min(0.01, 'Price must be greater than 0'),
	date: z.date(),
	currency: z.string().min(1, 'Currency is required'),
	holdingId: z.string().optional(),
})

type InvestmentTransactionFormValues = z.infer<typeof investmentTransactionSchema>

interface InvestmentTransactionFormProps {
	accountId?: string // Optional - if not provided, will show account selector
	accounts?: Array<{ id: string; name: string }> // Required if accountId is not provided
	holdings?: Array<{
		id: string
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
		averagePurchasePrice?: string
	}>
	initialData?: {
		id?: string
		type?: 'BUY' | 'SELL'
		symbol?: string
		assetType?: 'STOCK' | 'CRYPTO'
		quantity?: string
		price?: string
		date?: Date
		currency?: string
		holdingId?: string
	}
	onSuccess?: () => void
}

export function InvestmentTransactionForm({
	accountId,
	accounts,
	holdings = [],
	initialData,
	onSuccess,
}: InvestmentTransactionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const showAccountSelector = !accountId && accounts && accounts.length > 0
	const [selectedAccountId, setSelectedAccountId] = useState<string>(accountId || (accounts && accounts.length > 0 ? accounts[0].id : ''))
	const isEdit = !!initialData?.id

	if (!accountId && (!accounts || accounts.length === 0)) {
		return <div className="text-sm text-muted-foreground">No investment accounts available. Please create an investment account first.</div>
	}

	const form = useForm<InvestmentTransactionFormValues>({
		resolver: zodResolver(investmentTransactionSchema),
		defaultValues: {
			type: initialData?.type || 'BUY',
			symbol: initialData?.symbol || '',
			assetType: initialData?.assetType || 'STOCK',
			quantity: initialData?.quantity || '',
			price: initialData?.price || '',
			date: initialData?.date || new Date(),
			currency: initialData?.currency || DEFAULT_CURRENCY,
			holdingId: initialData?.holdingId || undefined,
		},
	})

	const transactionType = form.watch('type')
	const symbol = form.watch('symbol')
	const quantity = form.watch('quantity')
	const price = form.watch('price')

	// Filter holdings by symbol when symbol changes
	const matchingHoldings = holdings.filter((h) => h.symbol === symbol.toUpperCase())
	
	// Get existing holding for this symbol (if any)
	const existingHolding = matchingHoldings.length > 0 ? matchingHoldings[0] : null
	
	// Calculate what the average purchase price will be after this BUY transaction
	let calculatedAvgPrice: number | null = null
	
	if (transactionType === 'BUY' && existingHolding && quantity && price) {
		const oldQuantity = parseFloat(existingHolding.quantity || '0')
		const oldAvgPrice = parseFloat(existingHolding.averagePurchasePrice || '0')
		const newQuantity = parseFloat(quantity)
		const newPrice = parseFloat(price)
		
		if (oldQuantity > 0 && newQuantity > 0 && newPrice > 0) {
			const totalOldCost = oldQuantity * oldAvgPrice
			const newCost = newQuantity * newPrice
			const totalQuantity = oldQuantity + newQuantity
			calculatedAvgPrice = totalQuantity > 0 ? (totalOldCost + newCost) / totalQuantity : newPrice
		} else if (newQuantity > 0 && newPrice > 0) {
			calculatedAvgPrice = newPrice
		}
	} else if (transactionType === 'BUY' && !existingHolding && quantity && price) {
		const newPrice = parseFloat(price)
		if (newPrice > 0) {
			calculatedAvgPrice = newPrice
		}
	}

	const onSubmit = async (values: InvestmentTransactionFormValues) => {
		setIsSubmitting(true)
		try {
			const finalAccountId = accountId || selectedAccountId
			if (!finalAccountId) {
				toast.error('Please select an investment account')
				setIsSubmitting(false)
				return
			}

			let result
			if (isEdit && initialData?.id) {
				result = await updateInvestmentTransaction(initialData.id, {
					type: values.type,
					symbol: values.symbol.toUpperCase(),
					assetType: values.assetType,
					quantity: values.quantity,
					price: values.price,
					date: values.date,
					currency: values.currency,
					holdingId: values.holdingId || null,
				})
			} else {
				result = await createInvestmentTransaction({
					accountId: finalAccountId,
					holdingId: values.holdingId || null,
					type: values.type,
					symbol: values.symbol.toUpperCase(),
					assetType: values.assetType,
					quantity: values.quantity,
					price: values.price,
					date: values.date,
					currency: values.currency,
				})
			}

			if (result.success) {
				toast.success(`Investment transaction ${isEdit ? 'updated' : values.type === 'BUY' ? 'purchase recorded' : 'sale recorded'} successfully`)
				if (!isEdit) {
					form.reset()
				}
				onSuccess?.()
				router.refresh()
			} else {
				toast.error(result.error || `Failed to ${isEdit ? 'update' : 'create'} investment transaction`)
			}
		} catch (error) {
			toast.error('An error occurred')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{showAccountSelector && accounts && (
					<div className="space-y-2">
						<label className="text-sm font-medium">Investment Account</label>
						<Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
							<SelectTrigger>
								<SelectValue placeholder="Select account" />
							</SelectTrigger>
							<SelectContent>
								{accounts.map((account) => (
									<SelectItem key={account.id} value={account.id}>
										{account.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Transaction Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="BUY">Buy</SelectItem>
									<SelectItem value="SELL">Sell</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="symbol"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Symbol</FormLabel>
							<FormControl>
								<Input
									placeholder="AAPL, BTC, etc."
									{...field}
									onChange={(e) => field.onChange(e.target.value.toUpperCase())}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="assetType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Asset Type</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEdit}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select asset type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="STOCK">Stock</SelectItem>
									<SelectItem value="CRYPTO">Crypto</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{transactionType === 'SELL' && matchingHoldings.length > 0 && (
					<FormField
						control={form.control}
						name="holdingId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Holding (Optional)</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select holding" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="">None</SelectItem>
										{matchingHoldings.map((holding) => (
											<SelectItem key={holding.id} value={holding.id}>
												{holding.symbol} - {parseFloat(holding.quantity).toLocaleString()} @ {holding.assetType}
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
					name="quantity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Quantity</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.00000001"
									placeholder="0.00000000"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								{transactionType === 'BUY' ? 'Purchase Price per Unit' : 'Sale Price per Unit'}
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									{...field}
								/>
							</FormControl>
							{transactionType === 'BUY' && (
								<div className="text-xs text-muted-foreground space-y-1">
									{existingHolding ? (
										<>
											<div>Current avg purchase price: {formatCurrency(parseFloat(existingHolding.averagePurchasePrice || '0'), form.watch('currency') || DEFAULT_CURRENCY)}</div>
											{calculatedAvgPrice !== null && (
												<div className="font-medium">
													New avg purchase price: {formatCurrency(calculatedAvgPrice, form.watch('currency') || DEFAULT_CURRENCY)}
												</div>
											)}
										</>
									) : (
										<div>
											This will be set as the average purchase price for new holdings
										</div>
									)}
								</div>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Date</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											className={cn(
												'w-full pl-3 text-left font-normal',
												!field.value && 'text-muted-foreground'
											)}
										>
											{field.value ? formatDateFull(field.value) : 'Pick a date'}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
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
					name="currency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Currency</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{currencies.map((currency) => (
										<SelectItem key={currency.code} value={currency.code}>
											{currency.name} ({currency.symbol})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => onSuccess?.()}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Recording...' : `Record ${transactionType === 'BUY' ? 'Purchase' : 'Sale'}`}
					</Button>
				</div>
			</form>
		</Form>
	)
}

