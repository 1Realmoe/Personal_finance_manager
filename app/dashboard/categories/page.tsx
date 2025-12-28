import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getCategories } from '@/lib/data/categories'
import { CategoryForm } from '@/components/features/category-form'
import { CategoryActions } from '@/components/features/category-actions'
import { EntityList } from '@/components/features/entity-list-page'
import { Tag } from 'lucide-react'

async function CategoriesList() {
	const categories = await getCategories()

	return (
		<EntityList
			title="Categories"
			description="Organize your transactions with categories"
			emptyStateTitle="No categories yet"
			emptyStateDescription="Create your first category to get started!"
			emptyStateIcon={Tag}
			entities={categories}
			actionsComponent={(category) => <CategoryActions category={category} />}
			gradientColor="from-green-500/10 via-green-500/5 to-transparent"
			defaultIcon="Tag"
		/>
	)
}

export default async function CategoriesPage() {
	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold mb-2">Categories</h1>
					<p className="text-muted-foreground">
						Organize your transactions with custom categories
					</p>
				</div>
				<CategoryForm />
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
				<CategoriesList />
			</Suspense>
		</div>
	)
}

