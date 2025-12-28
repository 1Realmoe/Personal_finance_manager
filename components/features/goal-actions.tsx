'use client'

import { EntityActions } from './entity-actions'
import { GoalForm } from './goal-form'
import { deleteGoal } from '@/lib/actions/goal'

interface GoalActionsProps {
	goal: {
		id: string
		title: string
		description?: string | null
		targetAmount: string
		currentAmount: string
		currency: string
		targetDate?: Date | null
		accountId?: string | null
		icon?: string
		color?: string
	}
	accounts: Array<{ 
		id: string
		name: string
		currency?: string
	}>
}

export function GoalActions({ goal, accounts }: GoalActionsProps) {
	return (
		<EntityActions
			entity={goal}
			entityName="Goal"
			onDelete={async () => deleteGoal(goal.id)}
			editForm={(onClose) => (
				<GoalForm
					accounts={accounts}
					initialData={goal}
					onSuccess={onClose}
				/>
			)}
		/>
	)
}

