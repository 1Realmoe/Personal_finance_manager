'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, DollarSign } from 'lucide-react'
import { deleteHolding, updateCurrentPrice } from '@/lib/actions/investment'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AddHoldingForm } from '@/components/features/add-holding-form'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface HoldingActionsProps {
	holding: {
		id: string
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
		averagePurchasePrice: string
		currentPrice: string
		currency: string
		accountId: string
	}
	accountId?: string
}

export function HoldingActions({ holding, accountId }: HoldingActionsProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const [priceUpdateOpen, setPriceUpdateOpen] = useState(false)
	const [newPrice, setNewPrice] = useState(holding.currentPrice)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			const result = await deleteHolding(holding.id)
			if (result.success) {
				toast.success('Holding deleted successfully')
				router.refresh()
			} else {
				toast.error(result.error || 'Failed to delete holding')
			}
		} catch (error) {
			toast.error('Failed to delete holding')
		} finally {
			setIsDeleting(false)
		}
	}

	const handleUpdatePrice = async () => {
		try {
			const result = await updateCurrentPrice(holding.id, newPrice)
			if (result.success) {
				toast.success('Price updated successfully')
				setPriceUpdateOpen(false)
				router.refresh()
			} else {
				toast.error(result.error || 'Failed to update price')
			}
		} catch (error) {
			toast.error('Failed to update price')
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<Dialog open={priceUpdateOpen} onOpenChange={setPriceUpdateOpen}>
						<DialogTrigger asChild>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								<DollarSign className="mr-2 h-4 w-4" />
								Update Price
							</DropdownMenuItem>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Update Current Price</DialogTitle>
								<DialogDescription>
									Update the current price for {holding.symbol}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label>Current Price</Label>
									<Input
										type="number"
										step="0.01"
										value={newPrice}
										onChange={(e) => setNewPrice(e.target.value)}
										placeholder="0.00"
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										onClick={() => setPriceUpdateOpen(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleUpdatePrice}>
										Update Price
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

					<Dialog>
						<DialogTrigger asChild>
							<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
								<Edit className="mr-2 h-4 w-4" />
								Edit Holding
							</DropdownMenuItem>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>Edit Holding</DialogTitle>
								<DialogDescription>
									Update details for {holding.symbol}
								</DialogDescription>
							</DialogHeader>
							<AddHoldingForm
								accountId={accountId || holding.accountId}
								initialData={holding}
								onSuccess={() => router.refresh()}
							/>
						</DialogContent>
					</Dialog>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete the holding for {holding.symbol}.
									This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									disabled={isDeleting}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}

