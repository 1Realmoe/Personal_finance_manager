'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

interface MonthlyExpensesChartProps {
	data: Array<{ date: string; total: number }>
}

const chartConfig = {
	total: {
		label: 'Expenses',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
	// Format data for the chart - ensure all days of the month are represented
	const chartData = data.map((item) => ({
		date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
		total: item.total,
	}))

	if (chartData.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Monthly Expenses</CardTitle>
					<CardDescription>Daily spending for the current month</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col h-[300px] items-center justify-center text-center">
						<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-6 w-6 text-muted-foreground"
							>
								<path d="M3 3v18h18" />
								<path d="M18 17V9h-5v8h5z" />
								<path d="M13 17V5H8v12h5z" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold mb-2">No expense data</h3>
						<p className="text-sm text-muted-foreground">
							No expense data available for this month
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader>
				<CardTitle>Monthly Expenses</CardTitle>
				<CardDescription>Daily spending for the current month</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							className="text-xs text-muted-foreground"
						/>
						<ChartTooltip
							cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
							content={<ChartTooltipContent indicator="dot" />}
						/>
						<Bar
							dataKey="total"
							fill="var(--color-total)"
							radius={[4, 4, 0, 0]}
							className="transition-opacity hover:opacity-80"
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}

