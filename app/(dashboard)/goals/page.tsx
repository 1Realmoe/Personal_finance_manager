import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getGoals } from '@/lib/data/goals'
import { getAccounts } from '@/lib/data/accounts'
import { GoalForm } from '@/components/features/goal-form'
import { GoalActions } from '@/components/features/goal-actions'
import { Target, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDateShort, DEFAULT_CURRENCY } from '@/lib/format'
import * as LucideIcons from 'lucide-react'

function calculateProgress(currentAmount: string, targetAmount: string): number {
	const current = parseFloat(currentAmount || '0')
	const target = parseFloat(targetAmount || '1')
	if (target === 0) return 0
	return Math.min((current / target) * 100, 100)
}

function getGradientColor(color: string): string {
	// Create a gradient from the base color to a lighter version
	const colorMap: Record<string, string> = {
		'#8B5CF6': 'from-purple-500 to-purple-600',
		'#3B82F6': 'from-blue-500 to-blue-600',
		'#10B981': 'from-green-500 to-green-600',
		'#F59E0B': 'from-amber-500 to-amber-600',
		'#EF4444': 'from-red-500 to-red-600',
		'#EC4899': 'from-pink-500 to-pink-600',
		'#06B6D4': 'from-cyan-500 to-cyan-600',
		'#6366F1': 'from-indigo-500 to-indigo-600',
	}
	return colorMap[color] || 'from-purple-500 to-purple-600'
}

async function GoalsList({
	accounts,
}: {
	accounts: Array<{ id: string; name: string; currency?: string }>
}) {
	const goals = await getGoals()

	if (goals.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Goals</CardTitle>
					<CardDescription>Track your financial goals and progress</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<Target className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">No goals yet</h3>
					<p className="text-sm text-muted-foreground">
						Create your first goal to get started!
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				{goals.map((goal) => {
					const progress = calculateProgress(goal.currentAmount || '0', goal.targetAmount || '0')
					const isCompleted = progress >= 100
					const currentAmount = parseFloat(goal.currentAmount || '0')
					const targetAmount = parseFloat(goal.targetAmount || '0')
					const remaining = Math.max(0, targetAmount - currentAmount)
					const goalColor = goal.color || '#8B5CF6'
					const goalIcon = goal.icon || 'Target'
					const IconComponent = (LucideIcons as any)[goalIcon] || LucideIcons.Target
					const gradientClass = getGradientColor(goalColor)

					return (
						<Card
							key={goal.id}
							className="transition-all duration-200 hover:shadow-lg group relative overflow-hidden"
							style={{
								borderLeft: `4px solid ${goalColor}`,
							}}
						>
							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
								<GoalActions goal={goal} accounts={accounts} />
							</div>
							<CardHeader className="pb-4">
								<div className="flex items-start justify-between pr-8">
									<div className="flex items-start gap-3 flex-1">
										<div 
											className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
											style={{ 
												backgroundColor: `${goalColor}20`,
											}}
										>
											<IconComponent 
												className="h-6 w-6" 
												style={{ color: goalColor }}
											/>
										</div>
										<div className="flex-1 min-w-0">
											<CardTitle className="text-xl mb-1">{goal.title}</CardTitle>
											{goal.description && (
												<CardDescription className="mt-1 line-clamp-2">
													{goal.description}
												</CardDescription>
											)}
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground font-medium">Progress</span>
										<span className="font-semibold" style={{ color: goalColor }}>
											{progress.toFixed(1)}%
										</span>
									</div>
									<div className="h-3 bg-muted rounded-full overflow-hidden relative">
										<div
											className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-500 ease-out`}
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 pt-2">
									<div className="p-3 rounded-lg bg-muted/50">
										<p className="text-xs text-muted-foreground mb-1 font-medium">Current</p>
										<p className="text-lg font-bold" style={{ color: goalColor }}>
											{formatCurrency(currentAmount, goal.currency || DEFAULT_CURRENCY)}
										</p>
									</div>
									<div className="p-3 rounded-lg bg-muted/50">
										<p className="text-xs text-muted-foreground mb-1 font-medium">Target</p>
										<p className="text-lg font-bold">
											{formatCurrency(targetAmount, goal.currency || DEFAULT_CURRENCY)}
										</p>
									</div>
								</div>

								{!isCompleted && (
									<div className="pt-2 border-t">
										<div className="flex items-center gap-2 text-sm">
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">
												{formatCurrency(remaining, goal.currency || DEFAULT_CURRENCY)} remaining
											</span>
										</div>
									</div>
								)}

								{isCompleted && (
									<div className="pt-2 border-t">
										<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
											<Target className="h-4 w-4" />
											<span className="font-medium">Goal achieved!</span>
										</div>
									</div>
								)}

								{goal.targetDate && (
									<div className="pt-2 border-t">
										<p className="text-xs text-muted-foreground">
											Target date: {formatDateShort(goal.targetDate)}
										</p>
									</div>
								)}

								{goal.accountName && (
									<div className="pt-2 border-t">
										<p className="text-xs text-muted-foreground">
											Linked account: {goal.accountName}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}

export default async function GoalsPage() {
	const accounts = await getAccounts()

	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Goals</h1>
					<p className="text-muted-foreground">
						Track your financial goals and monitor your progress
					</p>
				</div>
				<GoalForm accounts={accounts} />
			</div>

			<Suspense
				fallback={
					<div className="grid gap-6 md:grid-cols-2">
						{[1, 2, 3, 4].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardHeader>
									<div className="h-6 w-32 bg-muted rounded mb-2" />
									<div className="h-4 w-48 bg-muted rounded" />
								</CardHeader>
								<CardContent>
									<div className="h-2 bg-muted rounded mb-4" />
									<div className="grid grid-cols-2 gap-4">
										<div className="h-8 bg-muted rounded" />
										<div className="h-8 bg-muted rounded" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				}
			>
				<GoalsList accounts={accounts} />
			</Suspense>
		</div>
	)
}

