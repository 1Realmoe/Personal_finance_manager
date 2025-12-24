'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { formatCurrency, DEFAULT_CURRENCY } from '@/lib/format'
import { useBalanceVisibility } from '@/contexts/balance-visibility-context'
import { TrendingUp } from 'lucide-react'

interface TopIncomeSourcesChartProps {
	data: Array<{ sourceName: string; total: number; currency: string }>
	displayCurrency?: string
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1']

const chartConfig = {
	total: {
		label: 'Amount',
		color: 'hsl(var(--chart-1))',
	},
} satisfies ChartConfig

export function TopIncomeSourcesChart({ data, displayCurrency }: TopIncomeSourcesChartProps) {
	const { isBalanceVisible } = useBalanceVisibility()
	
	if (data.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Top Income Sources</CardTitle>
							<CardDescription>All-time income breakdown by source</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col h-[300px] items-center justify-center text-center">
						<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
							<TrendingUp className="h-6 w-6 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold mb-2">No income data</h3>
						<p className="text-sm text-muted-foreground">
							No income transactions with sources available
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	const chartData = data.map((item, index) => ({
		name: item.sourceName,
		value: item.total,
		color: COLORS[index % COLORS.length],
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
						<CardTitle>Top Income Sources</CardTitle>
						<CardDescription>All-time income breakdown by source</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[400px] w-full">
					<BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis 
							type="number" 
							className="text-xs"
							tickFormatter={(value) => {
								if (!isBalanceVisible) return '••••'
								return formatAmount(value)
							}}
						/>
						<YAxis 
							dataKey="name" 
							type="category" 
							width={120}
							className="text-xs"
							tick={{ fontSize: 12 }}
						/>
						<ChartTooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									return (
										<div className="rounded-lg border bg-background p-2 shadow-sm">
											<div className="grid gap-2">
												<div className="flex items-center justify-between gap-4">
													<span className="text-sm font-medium">{payload[0].name}</span>
													<span className="text-sm font-bold">
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
						<Bar dataKey="value" radius={[0, 4, 4, 0]}>
							{chartData.map((entry, index) => (
								<Cell key={`bar-cell-${index}`} fill={entry.color} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}

