'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateMonthYear } from '@/lib/format'

export function MonthPicker() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [open, setOpen] = useState(false)

	// Parse month from URL or default to current month
	const monthParam = searchParams.get('month')
	const selectedDate = monthParam
		? new Date(monthParam + '-01')
		: new Date()

	const handleMonthChange = (date: Date | undefined) => {
		if (!date) return

		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const monthString = `${year}-${month}`

		const params = new URLSearchParams(searchParams.toString())
		params.set('month', monthString)
		router.push(`/dashboard?${params.toString()}`)
		setOpen(false)
	}

	const handlePreviousMonth = () => {
		const newDate = new Date(selectedDate)
		newDate.setMonth(newDate.getMonth() - 1)
		handleMonthChange(newDate)
	}

	const handleNextMonth = () => {
		const newDate = new Date(selectedDate)
		newDate.setMonth(newDate.getMonth() + 1)
		handleMonthChange(newDate)
	}

	const handleCurrentMonth = () => {
		handleMonthChange(new Date())
	}

	// When a day is selected, just use the month/year of that day
	const handleDaySelect = (date: Date | undefined) => {
		if (!date) return
		handleMonthChange(date)
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={handlePreviousMonth}
				className="h-9 w-9"
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						data-empty={!selectedDate}
						className={cn(
							'w-[240px] justify-start text-left font-normal',
							'data-[empty=true]:text-muted-foreground'
						)}
					>
						<CalendarIcon />
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

			<Button
				variant="outline"
				size="icon"
				onClick={handleNextMonth}
				className="h-9 w-9"
			>
				<ChevronRight className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleCurrentMonth}
				className="h-9"
			>
				Today
			</Button>
		</div>
	)
}

