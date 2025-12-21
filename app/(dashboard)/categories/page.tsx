import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategories } from '@/lib/data/categories'
import { CategoryForm } from '@/components/features/category-form'
import { CategoryActions } from '@/components/features/category-actions'
import { Tag } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

async function CategoriesList() {
	const categories = await getCategories()

	if (categories.length === 0) {
		return (
			<Card className="border-dashed">
				<CardHeader>
					<CardTitle>Categories</CardTitle>
					<CardDescription>Organize your transactions with categories</CardDescription>
				</CardHeader>
				<CardContent className="py-12 text-center">
					<div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
						<Tag className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">No categories yet</h3>
					<p className="text-sm text-muted-foreground">
						Create your first category to get started!
					</p>
				</CardContent>
			</Card>
		)
	}

	const incomeCategories = categories.filter((cat) => cat.type === 'INCOME')
	const expenseCategories = categories.filter((cat) => cat.type === 'EXPENSE')

	return (
		<div className="space-y-6">
			{incomeCategories.length > 0 && (
				<div>
					<h2 className="text-lg font-semibold mb-4">Income Categories</h2>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{incomeCategories.map((category) => {
							const IconComponent =
								(LucideIcons as any)[category.icon] || LucideIcons.Tag
							return (
								<Card
									key={category.id}
									className="transition-all duration-200 hover:shadow-md group relative"
								>
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<CategoryActions category={category} />
									</div>
									<CardContent className="p-4 flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
											<IconComponent className="h-5 w-5 text-green-600 dark:text-green-400" />
										</div>
										<div className="flex-1 pr-8">
											<p className="font-medium">{category.name}</p>
											<p className="text-xs text-muted-foreground">Income</p>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				</div>
			)}

			{expenseCategories.length > 0 && (
				<div>
					<h2 className="text-lg font-semibold mb-4">Expense Categories</h2>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{expenseCategories.map((category) => {
							const IconComponent =
								(LucideIcons as any)[category.icon] || LucideIcons.Tag
							return (
								<Card
									key={category.id}
									className="transition-all duration-200 hover:shadow-md group relative"
								>
									<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
										<CategoryActions category={category} />
									</div>
									<CardContent className="p-4 flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
											<IconComponent className="h-5 w-5 text-red-600 dark:text-red-400" />
										</div>
										<div className="flex-1 pr-8">
											<p className="font-medium">{category.name}</p>
											<p className="text-xs text-muted-foreground">Expense</p>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				</div>
			)}
		</div>
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

