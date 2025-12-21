'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'

interface IncomeExpenseChartProps {
	income: number
	expense: number
	currency?: string
}

const chartConfig = {
	income: {
		label: 'Income',
		color: 'hsl(142, 76%, 36%)',
	},
	expense: {
		label: 'Expense',
		color: 'hsl(0, 84%, 60%)',
	},
} satisfies ChartConfig

export function IncomeExpenseChart({ income, expense, currency = DEFAULT_CURRENCY }: IncomeExpenseChartProps) {
	const data = [
		{
			name: 'Income',
			income: income,
			expense: 0,
		},
		{
			name: 'Expense',
			income: 0,
			expense: expense,
		},
	]

	const netAmount = income - expense

	return (
		<Card className="transition-shadow duration-200 hover:shadow-lg">
			<CardHeader>
				<CardTitle>Income vs Expense</CardTitle>
				<CardDescription>Monthly comparison</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<ChartContainer config={chartConfig} className="h-[250px] w-full">
						<BarChart data={data}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-50" />
							<XAxis
								dataKey="name"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								className="text-xs text-muted-foreground"
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								className="text-xs text-muted-foreground"
							/>
							<ChartTooltip
								cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
								content={({ active, payload }) => {
									if (active && payload && payload.length) {
										const value = payload[0].value as number
										return (
											<div className="rounded-lg border bg-background p-2 shadow-sm">
												<div className="grid gap-2">
													<div className="flex items-center justify-between gap-4">
														<span className="text-sm font-medium">{payload[0].name}</span>
														<span className="text-sm font-bold">
															{formatCurrency(value, currency)}
														</span>
													</div>
												</div>
											</div>
										)
									}
									return null
								}}
							/>
							<Bar
								dataKey="income"
								fill="var(--color-income)"
								radius={[4, 4, 0, 0]}
								className="transition-opacity hover:opacity-80"
							/>
							<Bar
								dataKey="expense"
								fill="var(--color-expense)"
								radius={[4, 4, 0, 0]}
								className="transition-opacity hover:opacity-80"
							/>
						</BarChart>
					</ChartContainer>
					<div className="flex items-center justify-between pt-4 border-t">
						<div>
							<p className="text-sm text-muted-foreground">Net Amount</p>
							<p
								className={`text-2xl font-bold ${
									netAmount >= 0
										? 'text-green-600 dark:text-green-400'
										: 'text-red-600 dark:text-red-400'
								}`}
							>
								{formatCurrency(Math.abs(netAmount), currency)}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-muted-foreground">Savings Rate</p>
							<p className="text-2xl font-bold">
								{income > 0 ? ((netAmount / income) * 100).toFixed(1) : '0.0'}%
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

