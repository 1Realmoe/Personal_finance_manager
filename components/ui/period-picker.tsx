'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { formatDateMonthYear } from '@/lib/format'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'year'

export function PeriodPicker() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [open, setOpen] = useState(false)

	// Parse view mode, month/year from URL or default to current month
	const viewMode = (searchParams.get('view') as ViewMode) || 'month'
	const monthParam = searchParams.get('month')
	const yearParam = searchParams.get('year')

	const selectedDate = monthParam
		? new Date(monthParam + '-01')
		: yearParam
		? new Date(parseInt(yearParam), 0, 1)
		: new Date()

	const handleViewModeChange = (mode: ViewMode) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('view', mode)
		
		if (mode === 'year') {
			params.delete('month')
			// If no year param exists, use current year or extract from month param
			if (!yearParam) {
				if (monthParam) {
					const [year] = monthParam.split('-').map(Number)
					params.set('year', year.toString())
				} else {
					params.set('year', new Date().getFullYear().toString())
				}
			}
		} else {
			params.delete('year')
			// If no month param exists, use current month or extract from year param
			if (!monthParam) {
				if (yearParam) {
					const now = new Date()
					params.set('month', `${yearParam}-${String(now.getMonth() + 1).padStart(2, '0')}`)
				} else {
					const now = new Date()
					params.set('month', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
				}
			}
		}
		
		router.push(`/?${params.toString()}`)
	}

	const handleMonthChange = (date: Date | undefined) => {
		if (!date) return

		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const monthString = `${year}-${month}`

		const params = new URLSearchParams(searchParams.toString())
		params.set('month', monthString)
		params.set('view', 'month')
		params.delete('year')
		router.push(`/?${params.toString()}`)
		setOpen(false)
	}

	const handleYearChange = (year: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('year', year.toString())
		params.set('view', 'year')
		params.delete('month')
		router.push(`/?${params.toString()}`)
		setOpen(false)
	}

	const handlePreviousPeriod = () => {
		const params = new URLSearchParams(searchParams.toString())
		
		if (viewMode === 'year') {
			const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear()
			const newYear = currentYear - 1
			params.set('year', newYear.toString())
		} else {
			const newDate = new Date(selectedDate)
			newDate.setMonth(newDate.getMonth() - 1)
			const year = newDate.getFullYear()
			const month = String(newDate.getMonth() + 1).padStart(2, '0')
			params.set('month', `${year}-${month}`)
		}
		
		router.push(`/?${params.toString()}`)
	}

	const handleNextPeriod = () => {
		const params = new URLSearchParams(searchParams.toString())
		
		if (viewMode === 'year') {
			const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear()
			const newYear = currentYear + 1
			params.set('year', newYear.toString())
		} else {
			const newDate = new Date(selectedDate)
			newDate.setMonth(newDate.getMonth() + 1)
			const year = newDate.getFullYear()
			const month = String(newDate.getMonth() + 1).padStart(2, '0')
			params.set('month', `${year}-${month}`)
		}
		
		router.push(`/?${params.toString()}`)
	}

	const handleCurrentPeriod = () => {
		const params = new URLSearchParams(searchParams.toString())
		
		if (viewMode === 'year') {
			params.set('year', new Date().getFullYear().toString())
		} else {
			const now = new Date()
			params.set('month', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
		}
		
		router.push(`/?${params.toString()}`)
	}

	const handleDaySelect = (date: Date | undefined) => {
		if (!date) return
		handleMonthChange(date)
	}

	const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear()
	const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

	return (
		<div className="flex items-center gap-2">
			<Select value={viewMode} onValueChange={handleViewModeChange}>
				<SelectTrigger className="w-[100px] h-9">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="month">Month</SelectItem>
					<SelectItem value="year">Year</SelectItem>
				</SelectContent>
			</Select>

			<Button
				variant="outline"
				size="icon"
				onClick={handlePreviousPeriod}
				className="h-9 w-9"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{viewMode === 'month' ? (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							data-empty={!selectedDate}
							className={cn(
								'w-[200px] justify-start text-left font-normal',
								'data-[empty=true]:text-muted-foreground'
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formatDateMonthYear(selectedDate)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0" align="start">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={handleDaySelect}
							defaultMonth={selectedDate}
						/>
					</PopoverContent>
				</Popover>
			) : (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="w-[120px] justify-start text-left font-normal"
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{currentYear}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-3" align="start">
						<div className="grid grid-cols-3 gap-2">
							{years.map((year) => (
								<Button
									key={year}
									variant={year === currentYear ? 'default' : 'ghost'}
									size="sm"
									onClick={() => handleYearChange(year)}
									className="h-9"
								>
									{year}
								</Button>
							))}
						</div>
					</PopoverContent>
				</Popover>
			)}

			<Button
				variant="outline"
				size="icon"
				onClick={handleNextPeriod}
				className="h-9 w-9"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleCurrentPeriod}
				className="h-9"
			>
				{viewMode === 'year' ? 'This Year' : 'Today'}
			</Button>
		</div>
	)
}

