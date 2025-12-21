import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet, TrendingUp, Target, Receipt } from 'lucide-react'

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			{/* Header */}
			<header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Wallet className="h-6 w-6 text-primary" />
						<span className="text-xl font-bold">FinTrack</span>
					</div>
					<nav className="flex items-center gap-4">
						<Link href="/signin">
							<Button variant="ghost">Sign In</Button>
						</Link>
						<Link href="/signup">
							<Button>Get Started</Button>
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<main className="container mx-auto px-4 py-16 md:py-24">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight">
						Take Control of Your
						<span className="text-primary"> Finances</span>
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
						Track your income, expenses, and financial goals all in one place. 
						Simple, secure, and designed for you.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
						<Link href="/signup">
							<Button size="lg" className="text-lg px-8">
								Get Started Free
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</Link>
						<Link href="/signin">
							<Button size="lg" variant="outline" className="text-lg px-8">
								Sign In
							</Button>
						</Link>
					</div>
				</div>

				{/* Features Grid */}
				<div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
					<div className="p-6 rounded-lg border bg-card space-y-4">
						<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
							<Receipt className="h-6 w-6 text-primary" />
						</div>
						<h3 className="text-xl font-semibold">Track Transactions</h3>
						<p className="text-muted-foreground">
							Easily record and categorize your income and expenses. 
							Keep track of every transaction with detailed notes.
						</p>
					</div>

					<div className="p-6 rounded-lg border bg-card space-y-4">
						<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
							<TrendingUp className="h-6 w-6 text-primary" />
						</div>
						<h3 className="text-xl font-semibold">Visual Analytics</h3>
						<p className="text-muted-foreground">
							Beautiful charts and insights help you understand your spending 
							patterns and make better financial decisions.
						</p>
					</div>

					<div className="p-6 rounded-lg border bg-card space-y-4">
						<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
							<Target className="h-6 w-6 text-primary" />
						</div>
						<h3 className="text-xl font-semibold">Set Goals</h3>
						<p className="text-muted-foreground">
							Create financial goals and track your progress. 
							Stay motivated and achieve your dreams.
						</p>
					</div>
				</div>

				{/* CTA Section */}
				<div className="mt-24 p-8 md:p-12 rounded-lg border bg-card text-center space-y-6">
					<h2 className="text-3xl md:text-4xl font-bold">
						Ready to take control?
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Join thousands of users managing their finances with FinTrack. 
						Start your free account today.
					</p>
					<Link href="/signup">
						<Button size="lg" className="text-lg px-8">
							Create Your Account
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t mt-24">
				<div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
					<p>&copy; {new Date().getFullYear()} FinTrack. All rights reserved.</p>
				</div>
			</footer>
		</div>
	)
}

