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
import { createHolding, updateHolding } from '@/lib/actions/investment'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { currencies, DEFAULT_CURRENCY } from '@/lib/format'

const holdingSchema = z.object({
	symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
	assetType: z.enum(['STOCK', 'CRYPTO']),
	quantity: z.string().min(0.00000001, 'Quantity must be greater than 0'),
	averagePurchasePrice: z.string().min(0.01, 'Purchase price must be greater than 0'),
	currentPrice: z.string().min(0.01, 'Current price must be greater than 0'),
	currency: z.string().min(1, 'Currency is required'),
})

type HoldingFormValues = z.infer<typeof holdingSchema>

interface AddHoldingFormProps {
	accountId?: string // Optional - if not provided, will show account selector
	accounts?: Array<{ id: string; name: string }> // Required if accountId is not provided
	initialData?: {
		id?: string
		symbol?: string
		assetType?: 'STOCK' | 'CRYPTO'
		quantity?: string
		averagePurchasePrice?: string
		currentPrice?: string
		currency?: string
	}
	onSuccess?: () => void
}

export function AddHoldingForm({ accountId, accounts, initialData, onSuccess }: AddHoldingFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const router = useRouter()
	const isEdit = !!initialData?.id
	const showAccountSelector = !accountId && accounts && accounts.length > 0
	const [selectedAccountId, setSelectedAccountId] = useState<string>(accountId || (accounts && accounts.length > 0 ? accounts[0].id : ''))

	if (!accountId && (!accounts || accounts.length === 0)) {
		return <div className="text-sm text-muted-foreground">No investment accounts available. Please create an investment account first.</div>
	}

	const form = useForm<HoldingFormValues>({
		resolver: zodResolver(holdingSchema),
		defaultValues: {
			symbol: initialData?.symbol || '',
			assetType: initialData?.assetType || 'STOCK',
			quantity: initialData?.quantity || '',
			averagePurchasePrice: initialData?.averagePurchasePrice || '',
			currentPrice: initialData?.currentPrice || '',
			currency: initialData?.currency || DEFAULT_CURRENCY,
		},
	})

	const onSubmit = async (values: HoldingFormValues) => {
		setIsSubmitting(true)
		try {
			const finalAccountId = accountId || selectedAccountId
			if (!finalAccountId) {
				toast.error('Please select an investment account')
				setIsSubmitting(false)
				return
			}

			if (isEdit && initialData?.id) {
				const result = await updateHolding(initialData.id, {
					quantity: values.quantity,
					averagePurchasePrice: values.averagePurchasePrice,
					currentPrice: values.currentPrice,
					currency: values.currency,
				})
				if (result.success) {
					toast.success('Holding updated successfully')
					onSuccess?.()
					router.refresh()
				} else {
					toast.error(result.error || 'Failed to update holding')
				}
			} else {
				const result = await createHolding({
					accountId: finalAccountId,
					symbol: values.symbol.toUpperCase(),
					assetType: values.assetType,
					quantity: values.quantity,
					averagePurchasePrice: values.averagePurchasePrice,
					currentPrice: values.currentPrice,
					currency: values.currency,
				})
				if (result.success) {
					toast.success('Holding added successfully')
					form.reset()
					onSuccess?.()
					router.refresh()
				} else {
					toast.error(result.error || 'Failed to create holding')
				}
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
				<div className="p-3 bg-muted/50 rounded-lg border border-dashed mb-4">
					<p className="text-xs text-muted-foreground">
						<strong>When to use this:</strong> Manually add holdings for importing existing positions, quick setup, or corrections. 
						For tracking actual trades, use <strong>"Record Transaction"</strong> instead - it automatically calculates average purchase prices.
					</p>
				</div>
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
					name="symbol"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Symbol</FormLabel>
							<FormControl>
								<Input
									placeholder="AAPL, BTC, etc."
									{...field}
									onChange={(e) => field.onChange(e.target.value.toUpperCase())}
									disabled={isEdit}
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
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isEdit}
							>
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
					name="averagePurchasePrice"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Average Purchase Price</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="currentPrice"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current Price</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.01"
									placeholder="0.00"
									{...field}
								/>
							</FormControl>
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
						{isSubmitting ? 'Saving...' : isEdit ? 'Update Holding' : 'Add Holding'}
					</Button>
				</div>
			</form>
		</Form>
	)
}

