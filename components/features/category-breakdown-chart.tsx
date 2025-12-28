'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Pie, PieChart, Cell } from 'recharts'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface CategoryBreakdownChartProps {
	data: Array<{ categoryName: string; total: number; currency: string }>
	categoriesCount?: number
	displayCurrency?: string
	view?: 'month' | 'year'
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1']

const chartConfig = {
	total: {
		label: 'Amount',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig

export function CategoryBreakdownChart({ data, categoriesCount, displayCurrency, view = 'month' }: CategoryBreakdownChartProps) {
	const { isBalanceVisible } = useBalanceVisibility()
	
	if (data.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Category Breakdown</CardTitle>
							<CardDescription>
								{view === 'year' ? 'Top spending categories this year' : 'Top spending categories this month'}
							</CardDescription>
						</div>
						{categoriesCount !== undefined && (
							<div className="text-right">
								<p className="text-sm text-muted-foreground">Total Categories</p>
								<p className="text-2xl font-bold">{categoriesCount}</p>
							</div>
						)}
					</div>
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
							No expense data available for {view === 'year' ? 'this year' : 'this month'}
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const total = data.reduce((sum, item) => sum + item.total, 0)
	
	const chartData = data.map((item, index) => ({
		name: item.categoryName,
		value: item.total,
		color: COLORS[index % COLORS.length],
		percent: (item.total / total) * 100,
	}))

	const currency = displayCurrency || data[0]?.currency || DEFAULT_CURRENCY
	
	const formatAmount = (amount: number) => {
		if (!isBalanceVisible) return '••••••'
		return formatCurrency(amount, currency)
	}

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Category Breakdown</CardTitle>
						<CardDescription>
							{view === 'year' ? 'Top spending categories this year' : 'Top spending categories this month'}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col">
				<div className="flex-1 min-h-0 pb-4">
					<ChartContainer config={chartConfig} className="h-[200px] sm:h-[240px] lg:h-[260px] w-full">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={false}
								outerRadius="70%"
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
														<span className="text-xs sm:text-sm font-medium">{payload[0].name}</span>
														<span className="text-xs sm:text-sm font-bold">
															{formatAmount(payload[0].value as number)}
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
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t flex-shrink-0">
					{chartData.map((entry, index) => (
						<div
							key={`legend-${index}`}
							className="flex items-center justify-between gap-2 px-1 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<div
									className="h-2.5 w-2.5 shrink-0 rounded-full"
									style={{ backgroundColor: entry.color }}
								/>
								<span className="text-xs font-medium truncate">{entry.name}</span>
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
								<span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
									{entry.percent.toFixed(1)}%
								</span>
								<span className="text-xs font-semibold tabular-nums whitespace-nowrap">
									{formatAmount(entry.value)}
								</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

