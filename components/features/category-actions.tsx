'use client'

import { EntityActions } from './entity-actions'
import { CategoryForm } from './category-form'
import { deleteCategory } from '@/lib/actions/category'

interface CategoryActionsProps {
	category: {
		id: string
		name: string
		icon: string
	}
}

export function CategoryActions({ category }: CategoryActionsProps) {
	return (
		<EntityActions
			entity={category}
			entityName="Category"
			onDelete={async () => deleteCategory(category.id)}
			deleteWarning="Categories with transactions cannot be deleted."
			editForm={(onClose) => (
				<CategoryForm
					initialData={category}
					onSuccess={onClose}
				/>
			)}
		/>
	)
}

