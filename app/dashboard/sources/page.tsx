import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getSources } from '@/lib/data/sources'
import { SourceForm } from '@/components/features/source-form'
import { SourceActions } from '@/components/features/source-actions'
import { EntityList } from '@/components/features/entity-list-page'
import { Briefcase } from 'lucide-react'

async function SourcesList() {
	const sources = await getSources()

	return (
		<EntityList
			title="Sources"
			description="Track your income sources"
			emptyStateTitle="No sources yet"
			emptyStateDescription="Create your first source to get started!"
			emptyStateIcon={Briefcase}
			entities={sources}
			actionsComponent={(source) => <SourceActions source={source} />}
			gradientColor="from-blue-500/10 via-blue-500/5 to-transparent"
			defaultIcon="Briefcase"
		/>
	)
}

export default async function SourcesPage() {
	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Sources</h1>
					<p className="text-muted-foreground">
						Manage your income sources
					</p>
				</div>
				<SourceForm />
			</div>

			<Suspense
				fallback={
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Card key={i} className="animate-pulse">
								<CardContent className="p-4">
									<div className="h-10 w-10 bg-muted rounded-full mb-3" />
									<div className="h-4 w-24 bg-muted rounded" />
								</CardContent>
							</Card>
						))}
					</div>
				}
			>
				<SourcesList />
			</Suspense>
		</div>
	)
}

