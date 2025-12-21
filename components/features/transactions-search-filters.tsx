'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { CalendarIcon, X, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateShort } from '@/lib/format'

interface TransactionsSearchFiltersProps {
	accounts: Array<{ id: string; name: string }>
	categories: Array<{ id: string; name: string }>
	onFiltersChange: (filters: TransactionFilters) => void
}

export interface TransactionFilters {
	searchQuery: string
	dateFrom: Date | null
	dateTo: Date | null
	accountIds: string[]
	categoryIds: string[]
	type: 'INCOME' | 'EXPENSE' | 'ALL'
	amountMin: string
	amountMax: string
}

export function TransactionsSearchFilters({
	accounts,
	categories,
	onFiltersChange,
}: TransactionsSearchFiltersProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [dateFrom, setDateFrom] = useState<Date | null>(null)
	const [dateTo, setDateTo] = useState<Date | null>(null)
	const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'ALL'>('ALL')
	const [amountMin, setAmountMin] = useState('')
	const [amountMax, setAmountMax] = useState('')
	const [showFilters, setShowFilters] = useState(false)

	useEffect(() => {
		onFiltersChange({
			searchQuery,
			dateFrom,
			dateTo,
			accountIds: selectedAccounts,
			categoryIds: selectedCategories,
			type,
			amountMin,
			amountMax,
		})
	}, [searchQuery, dateFrom, dateTo, selectedAccounts, selectedCategories, type, amountMin, amountMax, onFiltersChange])

	const hasActiveFilters =
		dateFrom !== null ||
		dateTo !== null ||
		selectedAccounts.length > 0 ||
		selectedCategories.length > 0 ||
		type !== 'ALL' ||
		amountMin !== '' ||
		amountMax !== ''

	const clearFilters = () => {
		setSearchQuery('')
		setDateFrom(null)
		setDateTo(null)
		setSelectedAccounts([])
		setSelectedCategories([])
		setType('ALL')
		setAmountMin('')
		setAmountMax('')
	}

	const toggleAccount = (accountId: string) => {
		setSelectedAccounts((prev) =>
			prev.includes(accountId)
				? prev.filter((id) => id !== accountId)
				: [...prev, accountId]
		)
	}

	const toggleCategory = (categoryId: string) => {
		setSelectedCategories((prev) =>
			prev.includes(categoryId)
				? prev.filter((id) => id !== categoryId)
				: [...prev, categoryId]
		)
	}

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Input
						placeholder="Search transactions by description, category, or account..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowFilters(!showFilters)}
					className={cn(hasActiveFilters && 'border-primary')}
				>
					<Filter className="h-4 w-4 mr-2" />
					Filters
					{hasActiveFilters && (
						<span className="ml-2 h-2 w-2 rounded-full bg-primary" />
					)}
				</Button>
				{hasActiveFilters && (
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						<X className="h-4 w-4 mr-2" />
						Clear
					</Button>
				)}
			</div>

			{/* Filter Panel */}
			{showFilters && (
				<div className="rounded-lg border bg-card p-4 space-y-6">
					{/* First Row: Date Range and Type */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
						{/* Date Range - spans 2 columns on large screens */}
						<div className="space-y-2 md:col-span-2 lg:col-span-2">
							<label className="text-sm font-medium">Date Range</label>
							<div className="grid gap-2 sm:grid-cols-2">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'w-full justify-start text-left font-normal',
												!dateFrom && 'text-muted-foreground'
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{dateFrom ? formatDateShort(dateFrom) : 'From'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={dateFrom || undefined}
											onSelect={(date) => setDateFrom(date || null)}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												'w-full justify-start text-left font-normal',
												!dateTo && 'text-muted-foreground'
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{dateTo ? formatDateShort(dateTo) : 'To'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={dateTo || undefined}
											onSelect={(date) => setDateTo(date || null)}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						{/* Type */}
						<div>
							<label className="text-sm font-medium">Type</label>
							<Select value={type} onValueChange={(value: 'INCOME' | 'EXPENSE' | 'ALL') => setType(value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All</SelectItem>
									<SelectItem value="INCOME">Income</SelectItem>
									<SelectItem value="EXPENSE">Expense</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="text-sm font-medium">Min Amount</label>
							<Input
								type="number"
								step="0.01"
								placeholder="0.00"
								value={amountMin}
								onChange={(e) => setAmountMin(e.target.value)}
							/>
						</div>

						<div>
							<label className="text-sm font-medium">Max Amount</label>
							<Input
								type="number"
								step="0.01"
								placeholder="0.00"
								value={amountMax}
								onChange={(e) => setAmountMax(e.target.value)}
							/>
						</div>
					</div>

					{/* Accounts and Categories */}
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-medium">Accounts</label>
							<Select
								value={selectedAccounts.length > 0 ? selectedAccounts[0] : 'ALL'}
								onValueChange={(value) => {
									if (value === 'ALL') {
										setSelectedAccounts([])
									} else {
										setSelectedAccounts([value])
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="All accounts" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All accounts</SelectItem>
									{accounts.map((account) => (
										<SelectItem key={account.id} value={account.id}>
											{account.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{selectedAccounts.length > 0 && (
								<div className="flex items-center gap-2 mt-2">
									<span className="text-xs text-muted-foreground">
										Selected: {accounts.find((a) => a.id === selectedAccounts[0])?.name}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedAccounts([])}
										className="h-6 px-2 text-xs"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Categories</label>
							<Select
								value={selectedCategories.length > 0 ? selectedCategories[0] : 'ALL'}
								onValueChange={(value) => {
									if (value === 'ALL') {
										setSelectedCategories([])
									} else {
										setSelectedCategories([value])
									}
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="All categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All categories</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{selectedCategories.length > 0 && (
								<div className="flex items-center gap-2 mt-2">
									<span className="text-xs text-muted-foreground">
										Selected: {categories.find((c) => c.id === selectedCategories[0])?.name}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setSelectedCategories([])}
										className="h-6 px-2 text-xs"
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

