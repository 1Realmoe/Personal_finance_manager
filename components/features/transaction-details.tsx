'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDateFull, DEFAULT_CURRENCY } from '@/lib/format'
import { Calendar, Wallet, Tag, DollarSign, Repeat, FileText, TrendingUp, TrendingDown, ArrowRight, Image as ImageIcon, X } from 'lucide-react'

interface TransactionDetailsProps {
	transaction: {
		id: string
		amount: string
		description: string
		date: Date | string
		accountName: string | null
		toAccountName?: string | null
		categoryName?: string | null
		type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
		currency?: string
		sourceId?: string | null
		sourceName?: string | null
		isRecurrent?: boolean
		recurrenceFrequency?: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | null
		receiptImage?: string | null
	}
	open: boolean
	onOpenChange: (open: boolean) => void
}

const frequencyLabels: Record<string, string> = {
	DAILY: 'Daily',
	WEEKLY: 'Weekly',
	MONTHLY: 'Monthly',
	YEARLY: 'Yearly',
}

export function TransactionDetails({ transaction, open, onOpenChange }: TransactionDetailsProps) {
	const dateObj = typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date
	const isIncome = transaction.type === 'INCOME'
	const isTransfer = transaction.type === 'TRANSFER'
	const currency = transaction.currency || DEFAULT_CURRENCY

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
				<DialogHeader className="space-y-3 pb-6 border-b flex-shrink-0">
					<DialogTitle className="text-2xl font-semibold">Transaction Details</DialogTitle>
					<DialogDescription className="text-base">
						View all information about this transaction
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-6 overflow-y-auto flex-1 pr-2">
					{/* Amount - Prominent Display */}
					<div className="flex flex-col items-center justify-center p-6 rounded-lg bg-muted/50">
						<p className="text-sm text-muted-foreground mb-2">Amount</p>
						<p className={`text-3xl font-bold ${
							isIncome 
								? 'text-green-600 dark:text-green-400' 
								: isTransfer
								? 'text-blue-600 dark:text-blue-400'
								: 'text-red-600 dark:text-red-400'
						}`}>
							{isIncome ? '+' : isTransfer ? '' : '-'}
							{formatCurrency(transaction.amount || '0', currency)}
						</p>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<FileText className="h-4 w-4" />
							<span className="font-medium">Description</span>
						</div>
						<p className="text-base font-medium pl-6">{transaction.description}</p>
					</div>

					{/* Transaction Type */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							{isIncome ? (
								<TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
							) : isTransfer ? (
								<ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
							)}
							<span className="font-medium">Type</span>
						</div>
						<div className="pl-6">
							<span
								className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
									isIncome
										? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
										: isTransfer
										? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
										: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
								}`}
							>
								{transaction.type}
							</span>
						</div>
					</div>

					{/* Date */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span className="font-medium">Date</span>
						</div>
						<p className="text-base pl-6">{formatDateFull(dateObj)}</p>
					</div>

					{/* Account(s) */}
					{isTransfer ? (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Wallet className="h-4 w-4" />
								<span className="font-medium">Transfer</span>
							</div>
							<div className="pl-6 space-y-2">
								<div>
									<p className="text-xs text-muted-foreground mb-1">From Account</p>
									<p className="text-base font-medium">{transaction.accountName || '—'}</p>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-xs text-muted-foreground mb-1">To Account</p>
									<p className="text-base font-medium">{transaction.toAccountName || '—'}</p>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Wallet className="h-4 w-4" />
								<span className="font-medium">Account</span>
							</div>
							<p className="text-base pl-6">{transaction.accountName || '—'}</p>
						</div>
					)}

					{/* Category */}
					{transaction.categoryName && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Tag className="h-4 w-4" />
								<span className="font-medium">Category</span>
							</div>
							<p className="text-base pl-6">{transaction.categoryName}</p>
						</div>
					)}

					{/* Source */}
					{transaction.sourceName && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<DollarSign className="h-4 w-4" />
								<span className="font-medium">Source</span>
							</div>
							<p className="text-base pl-6">{transaction.sourceName}</p>
						</div>
					)}

					{/* Recurring Information */}
					{transaction.isRecurrent && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Repeat className="h-4 w-4" />
								<span className="font-medium">Recurring Transaction</span>
							</div>
							<div className="pl-6 space-y-1">
								<p className="text-base">This is a recurring transaction</p>
								{transaction.recurrenceFrequency && (
									<p className="text-sm text-muted-foreground">
										Frequency: <span className="font-medium">{frequencyLabels[transaction.recurrenceFrequency]}</span>
									</p>
								)}
							</div>
						</div>
					)}

					{/* Currency */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<DollarSign className="h-4 w-4" />
							<span className="font-medium">Currency</span>
						</div>
						<p className="text-base pl-6">{currency}</p>
					</div>

					{/* Receipt */}
					{transaction.receiptImage && (
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<ImageIcon className="h-4 w-4" />
								<span className="font-medium">Receipt</span>
							</div>
							<div className="pl-6">
								<div className="rounded-lg border border-border overflow-hidden bg-muted/50">
									<img
										src={transaction.receiptImage}
										alt="Receipt"
										className="w-full h-auto max-h-48 object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
										onClick={(e) => {
											e.stopPropagation()
											// Open in a modal/lightbox for better viewing
											// Use z-[9999] to ensure it's well above the dialog (which uses z-50)
											const modal = document.createElement('div')
											modal.className = 'fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out'
											modal.style.pointerEvents = 'auto'
											
											const closeModal = () => {
												if (document.body.contains(modal)) {
													document.body.removeChild(modal)
													document.removeEventListener('keydown', handleEscape)
												}
											}
											
											// Add escape key handler
											const handleEscape = (e: KeyboardEvent) => {
												if (e.key === 'Escape' && document.body.contains(modal)) {
													e.preventDefault()
													e.stopPropagation()
													closeModal()
												}
											}
											document.addEventListener('keydown', handleEscape, true)
											
											// Close when clicking the backdrop (but not the image or button)
											modal.onclick = (e) => {
												if (e.target === modal) {
													e.preventDefault()
													e.stopPropagation()
													closeModal()
												}
											}
											
											// Create close button
											const closeButton = document.createElement('button')
											closeButton.className = 'absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors backdrop-blur-sm flex items-center justify-center'
											closeButton.style.pointerEvents = 'auto'
											closeButton.setAttribute('aria-label', 'Close')
											closeButton.innerHTML = `
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<line x1="18" y1="6" x2="6" y2="18"></line>
													<line x1="6" y1="6" x2="18" y2="18"></line>
												</svg>
											`
											closeButton.onclick = (e) => {
												e.preventDefault()
												e.stopPropagation()
												closeModal()
											}
											
											// Create image container
											const imageContainer = document.createElement('div')
											imageContainer.className = 'relative max-w-full max-h-[90vh] flex items-center justify-center'
											imageContainer.style.pointerEvents = 'auto'
											imageContainer.onclick = (e) => {
												e.stopPropagation()
											}
											
											const img = document.createElement('img')
											img.src = transaction.receiptImage!
											img.alt = 'Receipt'
											img.className = 'max-w-full max-h-[90vh] object-contain'
											img.style.pointerEvents = 'auto'
											
											imageContainer.appendChild(img)
											modal.appendChild(closeButton)
											modal.appendChild(imageContainer)
											
											// Append to body and ensure it's on top
											document.body.appendChild(modal)
											// Force a reflow to ensure z-index is applied
											modal.offsetHeight
										}}
									/>
									<p className="text-xs text-muted-foreground mt-2 text-center">
										Click to view full size
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

