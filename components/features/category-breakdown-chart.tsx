'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Pie, PieChart, Cell } from 'recharts'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'

interface CategoryBreakdownChartProps {
	data: Array<{ categoryName: string; total: number; currency: string }>
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1']

const chartConfig = {
	total: {
		label: 'Amount',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
	if (data.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Category Breakdown</CardTitle>
					<CardDescription>Top spending categories this month</CardDescription>
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
								<circle cx="12" cy="12" r="10" />
								<path d="M12 6v6l4 2" />
							</svg>
						</div>
						<h3 className="text-lg font-semibold mb-2">No category data</h3>
						<p className="text-sm text-muted-foreground">
							No expense data available for this month
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const chartData = data.map((item, index) => ({
		name: item.categoryName,
		value: item.total,
		color: COLORS[index % COLORS.length],
	}))

	const currency = data[0]?.currency || DEFAULT_CURRENCY

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader>
				<CardTitle>Category Breakdown</CardTitle>
				<CardDescription>Top spending categories this month</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
							nameKey="name"
						>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
						<ChartTooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									return (
										<div className="rounded-lg border bg-background p-2 shadow-sm">
											<div className="grid gap-2">
												<div className="flex items-center justify-between gap-4">
													<span className="text-sm font-medium">{payload[0].name}</span>
													<span className="text-sm font-bold">
														{formatCurrency(payload[0].value as number, currency)}
													</span>
												</div>
											</div>
										</div>
									)
								}
								return null
							}}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}

