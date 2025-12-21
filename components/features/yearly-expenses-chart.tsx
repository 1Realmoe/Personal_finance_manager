'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'

interface YearlyExpensesChartProps {
	data: Array<{ month: number; total: number }>
	currency?: string
}

const chartConfig = {
	total: {
		label: 'Expenses',
		color: '#EF4444',
	},
} satisfies ChartConfig

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function YearlyExpensesChart({ data, currency = DEFAULT_CURRENCY }: YearlyExpensesChartProps) {
	const { isBalanceVisible } = useBalanceVisibility()
	
	// Create data for all 12 months, filling in zeros for months without data
	const chartData = Array.from({ length: 12 }, (_, i) => {
		const monthData = data.find((d) => d.month === i + 1)
		return {
			month: monthNames[i],
			total: monthData?.total || 0,
		}
	})
	
	const formatAmount = (amount: number) => {
		if (!isBalanceVisible) return '••••••'
		return formatCurrency(amount, currency)
	}

	if (data.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Yearly Expenses</CardTitle>
					<CardDescription className="text-sm">Monthly spending breakdown</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col h-[200px] items-center justify-center text-center">
						<div className="mx-auto h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-5 w-5 text-muted-foreground"
							>
								<path d="M3 3v18h18" />
								<path d="M18 17V9h-5v8h5z" />
								<path d="M13 17V5H8v12h5z" />
							</svg>
						</div>
						<h3 className="text-base font-semibold mb-1">No expense data</h3>
						<p className="text-xs text-muted-foreground">
							No expense data available for this year
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Yearly Expenses</CardTitle>
				<CardDescription className="text-sm">Monthly spending breakdown</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[200px] w-full">
					<BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={6}
							tick={{ fontSize: 11 }}
							className="text-xs text-muted-foreground"
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={6}
							tick={{ fontSize: 11 }}
							className="text-xs text-muted-foreground"
							width={50}
						/>
						<ChartTooltip
							cursor={{ fill: 'rgba(239, 68, 68, 0.08)' }}
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									return (
										<div className="rounded-lg border bg-background p-2 shadow-sm">
											<div className="grid gap-1">
												<p className="text-xs text-muted-foreground">
													{payload[0].payload.month}
												</p>
												<p className="text-sm font-bold text-red-600 dark:text-red-400">
													{formatAmount(payload[0].value as number)}
												</p>
											</div>
										</div>
									)
								}
								return null
							}}
						/>
						<Bar
							dataKey="total"
							fill="url(#colorGradient)"
							radius={[6, 6, 0, 0]}
							className="transition-opacity hover:opacity-90"
						/>
						<defs>
							<linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
								<stop offset="100%" stopColor="#EF4444" stopOpacity={0.2} />
							</linearGradient>
						</defs>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}

