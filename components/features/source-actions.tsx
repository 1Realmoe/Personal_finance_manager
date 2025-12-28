'use client'

import { EntityActions } from './entity-actions'
import { SourceForm } from './source-form'
import { deleteSource } from '@/lib/actions/source'

interface SourceActionsProps {
	source: {
		id: string
		name: string
		icon: string
	}
}

export function SourceActions({ source }: SourceActionsProps) {
	return (
		<EntityActions
			entity={source}
			entityName="Source"
			onDelete={async () => deleteSource(source.id)}
			deleteWarning="Sources with transactions cannot be deleted."
			editForm={(onClose) => (
				<SourceForm
					initialData={source}
					onSuccess={onClose}
				/>
			)}
		/>
	)
}

