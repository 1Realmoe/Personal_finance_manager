import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface Entity {
	id: string
	name: string
	icon: string
}

interface EntityListProps<T extends Entity> {
	title: string
	description: string
	emptyStateTitle: string
	emptyStateDescription: string
	emptyStateIcon: LucideIcon
	entities: T[]
	actionsComponent: (entity: T) => ReactNode
	gradientColor: string
	defaultIcon: keyof typeof LucideIcons
}

export function EntityList<T extends Entity>({
	title,
	description,
	emptyStateTitle,
	emptyStateDescription,
	emptyStateIcon: EmptyStateIcon,
	entities,
	actionsComponent,
	gradientColor,
	defaultIcon,
}: EntityListProps<T>) {
	if (entities.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<EmptyStateIcon className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">{emptyStateTitle}</h3>
					<p className="text-sm text-muted-foreground">{emptyStateDescription}</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{entities.map((entity) => {
					const IconComponent =
						(LucideIcons as any)[entity.icon] || (LucideIcons as any)[defaultIcon]
					return (
						<Card
							key={entity.id}
							className="transition-all duration-200 hover:shadow-md group relative overflow-hidden"
						>
							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
								{actionsComponent(entity)}
							</div>
							{/* Gradient overlay */}
							<div
								className={`absolute inset-0 bg-gradient-to-l ${gradientColor} pointer-events-none`}
							/>
							<CardContent className="p-4 flex items-center gap-3 relative z-0">
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
									<IconComponent className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 pr-8">
									<p className="font-medium">{entity.name}</p>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}

