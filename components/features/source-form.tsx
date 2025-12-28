'use client'

import { Briefcase, Youtube, Link2, DollarSign, Building2, Laptop, Smartphone, TrendingUp, Users, FileText } from 'lucide-react'
import { createSource, updateSource } from '@/lib/actions/source'
import { IconEntityForm } from './icon-entity-form'

const iconOptions = [
	{ value: 'Briefcase', label: 'Business', icon: Briefcase },
	{ value: 'Youtube', label: 'YouTube', icon: Youtube },
	{ value: 'Link2', label: 'Affiliate', icon: Link2 },
	{ value: 'DollarSign', label: 'Freelance', icon: DollarSign },
	{ value: 'Building2', label: 'Company', icon: Building2 },
	{ value: 'Laptop', label: 'Online', icon: Laptop },
	{ value: 'Smartphone', label: 'Mobile', icon: Smartphone },
	{ value: 'TrendingUp', label: 'Investment', icon: TrendingUp },
	{ value: 'Users', label: 'Partnership', icon: Users },
	{ value: 'FileText', label: 'Other', icon: FileText },
]

interface SourceFormProps {
	initialData?: {
		id?: string
		name?: string
		icon?: string
	}
	onSuccess?: () => void
}

export function SourceForm({ initialData, onSuccess }: SourceFormProps) {
	return (
		<IconEntityForm
			entityType="source"
			entityName="Source"
			iconOptions={iconOptions}
			defaultIcon="Briefcase"
			nameLabel="Source Name"
			namePlaceholder="e.g., YouTube, Freelance"
			createAction={createSource}
			updateAction={updateSource}
			initialData={initialData}
			onSuccess={onSuccess}
		/>
	)
}

