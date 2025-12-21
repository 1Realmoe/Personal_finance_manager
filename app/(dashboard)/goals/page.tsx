import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getGoals } from '@/lib/data/goals'
import { getAccounts } from '@/lib/data/accounts'
import { GoalForm } from '@/components/features/goal-form'
import { GoalActions } from '@/components/features/goal-actions'
import { Target, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { format } from 'date-fns'

function calculateProgress(currentAmount: string, targetAmount: string): number {
	const current = parseFloat(currentAmount || '0')
	const target = parseFloat(targetAmount || '1')
	if (target === 0) return 0
	return Math.min((current / target) * 100, 100)
}

function getProgressColor(progress: number): string {
	if (progress >= 100) return 'bg-green-500'
	if (progress >= 75) return 'bg-blue-500'
	if (progress >= 50) return 'bg-yellow-500'
	return 'bg-primary'
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
					const progressColor = getProgressColor(progress)
					const isCompleted = progress >= 100
					const currentAmount = parseFloat(goal.currentAmount || '0')
					const targetAmount = parseFloat(goal.targetAmount || '0')
					const remaining = Math.max(0, targetAmount - currentAmount)

					return (
						<Card
							key={goal.id}
							className="transition-all duration-200 hover:shadow-md group relative"
						>
							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<GoalActions goal={goal} accounts={accounts} />
							</div>
							<CardHeader className="pb-4">
								<div className="flex items-start justify-between pr-8">
									<div className="flex-1">
										<CardTitle className="text-xl mb-1">{goal.title}</CardTitle>
										{goal.description && (
											<CardDescription className="mt-1">
												{goal.description}
											</CardDescription>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Progress</span>
										<span className="font-medium">
											{progress.toFixed(1)}%
										</span>
									</div>
									<div className="h-2 bg-muted rounded-full overflow-hidden">
										<div
											className={`h-full ${progressColor} transition-all duration-300`}
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 pt-2">
									<div>
										<p className="text-xs text-muted-foreground mb-1">Current</p>
										<p className="text-lg font-semibold">
											{formatCurrency(currentAmount, goal.currency || 'USD')}
										</p>
									</div>
									<div>
										<p className="text-xs text-muted-foreground mb-1">Target</p>
										<p className="text-lg font-semibold">
											{formatCurrency(targetAmount, goal.currency || 'USD')}
										</p>
									</div>
								</div>

								{!isCompleted && (
									<div className="pt-2 border-t">
										<div className="flex items-center gap-2 text-sm">
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">
												{formatCurrency(remaining, goal.currency || 'USD')} remaining
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
											Target date: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
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

