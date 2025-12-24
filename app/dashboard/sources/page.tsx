import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSources } from '@/lib/data/sources'
import { SourceForm } from '@/components/features/source-form'
import { SourceActions } from '@/components/features/source-actions'
import { Briefcase } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

async function SourcesList() {
	const sources = await getSources()

	if (sources.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Sources</CardTitle>
					<CardDescription>Track your income sources</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<Briefcase className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">No sources yet</h3>
					<p className="text-sm text-muted-foreground">
						Create your first source to get started!
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
				{sources.map((source) => {
					const IconComponent =
						(LucideIcons as any)[source.icon] || LucideIcons.Briefcase
					return (
						<Card
							key={source.id}
							className="transition-all duration-200 hover:shadow-md group relative overflow-hidden"
						>
							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
								<SourceActions source={source} />
							</div>
							{/* Gradient overlay from bottom */}
							<div className="absolute inset-0 bg-gradient-to-l from-blue-500/10 via-blue-500/5 to-transparent pointer-events-none" />
							<CardContent className="p-4 flex items-center gap-3 relative z-0">
								<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
									<IconComponent className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 pr-8">
									<p className="font-medium">{source.name}</p>
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
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

