'use client'

import { Tag, Home, Utensils, DollarSign, ShoppingCart, Car, Heart, Gamepad2, Coffee, Plane, GraduationCap } from 'lucide-react'
import { createCategory, updateCategory } from '@/lib/actions/category'
import { IconEntityForm } from './icon-entity-form'

const iconOptions = [
	{ value: 'Home', label: 'Home', icon: Home },
	{ value: 'Utensils', label: 'Food', icon: Utensils },
	{ value: 'DollarSign', label: 'Money', icon: DollarSign },
	{ value: 'ShoppingCart', label: 'Shopping', icon: ShoppingCart },
	{ value: 'Car', label: 'Transport', icon: Car },
	{ value: 'Heart', label: 'Health', icon: Heart },
	{ value: 'Gamepad2', label: 'Entertainment', icon: Gamepad2 },
	{ value: 'Coffee', label: 'Coffee', icon: Coffee },
	{ value: 'Plane', label: 'Travel', icon: Plane },
	{ value: 'GraduationCap', label: 'Education', icon: GraduationCap },
	{ value: 'Tag', label: 'Other', icon: Tag },
]

interface CategoryFormProps {
	initialData?: {
		id?: string
		name?: string
		icon?: string
	}
	onSuccess?: () => void
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
	return (
		<IconEntityForm
			entityType="category"
			entityName="Category"
			iconOptions={iconOptions}
			defaultIcon="Tag"
			nameLabel="Category Name"
			namePlaceholder="e.g., Groceries"
			createAction={createCategory}
			updateAction={updateCategory}
			initialData={initialData}
			onSuccess={onSuccess}
		/>
	)
}

