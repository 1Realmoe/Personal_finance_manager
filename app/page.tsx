import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
	ArrowRight, 
	Wallet, 
	TrendingUp, 
	Target, 
	Receipt, 
	Scan, 
	Globe, 
	BarChart3, 
	Shield, 
	Zap,
	CheckCircle2,
	Github,
	ExternalLink,
	Lock,
	PiggyBank,
	LineChart,
	CreditCard,
	Coins,
	Building2,
	Database,
	Code2,
	Layers,
	Sparkles,
	Star,
	Award,
	Rocket,
	TrendingDown,
	Calendar,
	Repeat,
	Tag,
	FileText,
	Eye,
	Clock,
	ArrowUpRight,
	Check
} from 'lucide-react'

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Subtle grid pattern background */}
			<div className="fixed inset-0 -z-10 opacity-[0.02] dark:opacity-[0.03]">
				<div className="absolute inset-0" style={{
					backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
					backgroundSize: '48px 48px'
				}}></div>
			</div>

			{/* Header */}
			<header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm"></div>
							<div className="relative bg-primary/5 border border-primary/20 rounded-lg p-2">
								<Wallet className="h-5 w-5 text-primary" />
							</div>
						</div>
						<span className="text-xl font-semibold tracking-tight">
							FinTrack
						</span>
					</div>
					<nav className="flex items-center gap-2">
						<Link href="https://github.com/1Realmoe/FinTrack" target="_blank" rel="noopener noreferrer">
							<Button variant="ghost" size="sm" className="gap-2 h-9">
								<Github className="h-4 w-4" />
								<span className="hidden sm:inline text-xs">GitHub</span>
							</Button>
						</Link>
						<Link href="/signin">
							<Button variant="ghost" size="sm" className="h-9">Sign In</Button>
						</Link>
						<Link href="/signup">
							<Button size="sm" className="h-9 gap-1.5">
								Get Started
								<ArrowRight className="h-3.5 w-3.5" />
							</Button>
						</Link>
					</nav>
				</div>
			</header>

			{/* Hero Section */}
			<main className="container mx-auto px-4 py-20 md:py-32">
				<div className="max-w-5xl mx-auto text-center space-y-10">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm text-xs font-medium text-foreground/80 mb-2">
						<Globe className="h-3.5 w-3.5 text-blue-500" />
						<span>Multi-Currency Finance Platform</span>
						<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
					</div>
					<div className="space-y-6">
						<h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1]">
							<span className="text-foreground">Smart Finance</span>
							<br />
							<span className="text-foreground/70">Management</span>
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
							Multi-currency accounts, investment portfolio tracking, and comprehensive analytics. 
							Take control of your wealth across currencies and asset classes.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
						<Link href="/signup">
							<Button size="lg" className="h-11 px-6 gap-2 font-medium">
								Get Started
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Link href="/signin">
							<Button size="lg" variant="outline" className="h-11 px-6 border-border/50">
								Sign In
							</Button>
						</Link>
					</div>
					<div className="pt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
						<Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
						<span>Try demo:</span>
						<code className="px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-foreground font-mono text-[11px]">demo@demo.com</code>
						<span>/</span>
						<code className="px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-foreground font-mono text-[11px]">demo4321-</code>
					</div>
				</div>

				{/* Key Features Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-32 max-w-6xl mx-auto">
					<div className="group p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200 space-y-4">
						<div className="flex items-start justify-between">
							<div className="h-11 w-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
								<Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Multi-Currency Support</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Manage accounts in USD, EUR, GBP, SEK with real-time exchange rates. Unified dashboard shows your net worth in your base currency.
							</p>
						</div>
					</div>

					<div className="group p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200 space-y-4">
						<div className="flex items-start justify-between">
							<div className="h-11 w-11 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/15 transition-colors">
								<TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Investment Portfolio</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Track stocks and crypto holdings with automatic cost basis calculation, gain/loss tracking, and portfolio performance metrics.
							</p>
						</div>
					</div>

					<div className="group p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200 space-y-4">
						<div className="flex items-start justify-between">
							<div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
								<Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Transaction Management</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Easily track income, expenses, and transfers. Organize with custom categories and set up recurring transactions.
							</p>
						</div>
					</div>

					<div className="group p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200 space-y-4">
						<div className="flex items-start justify-between">
							<div className="h-11 w-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
								<BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
							</div>
							<ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Visual Analytics</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Interactive charts showing income vs expenses, category breakdowns, and spending patterns with monthly and yearly views.
							</p>
						</div>
					</div>

					<div className="group p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200 space-y-4">
						<div className="flex items-start justify-between">
							<div className="h-11 w-11 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/15 transition-colors">
								<Target className="h-5 w-5 text-rose-600 dark:text-rose-400" />
							</div>
							<ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Financial Goals</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Set savings targets with visual progress tracking. Link goals to specific accounts and track your journey to financial freedom.
							</p>
						</div>
					</div>

					<div className="group p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200 space-y-4">
						<div className="flex items-start justify-between">
							<div className="h-11 w-11 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center group-hover:bg-slate-500/15 transition-colors">
								<Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
							</div>
							<ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-semibold">Secure & Private</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Enterprise-grade security with Clerk authentication. All data is isolated by user with protected routes and encrypted storage.
							</p>
						</div>
					</div>
				</div>

				{/* Tech Stack Section */}
				<div className="mt-40 max-w-5xl mx-auto">
					<div className="text-center space-y-3 mb-12">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground mb-2">
							<Code2 className="h-3 w-3" />
							<span>Technology Stack</span>
						</div>
						<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Built with Modern Technology</h2>
						<p className="text-sm text-muted-foreground">
							Powered by Next.js 16, React 19, TypeScript, and PostgreSQL
						</p>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{[
							{ name: 'Next.js 16', desc: 'App Router', icon: Layers },
							{ name: 'React 19', desc: 'Server Components', icon: Code2 },
							{ name: 'TypeScript', desc: 'Type Safe', icon: FileText },
							{ name: 'PostgreSQL', desc: 'Neon Serverless', icon: Database },
							{ name: 'Drizzle ORM', desc: 'Type-Safe DB', icon: Database },
							{ name: 'Clerk', desc: 'Authentication', icon: Lock },
							{ name: 'Recharts', desc: 'Data Visualization', icon: BarChart3 },
							{ name: 'Tailwind CSS', desc: 'Styling', icon: Sparkles },
						].map((tech, i) => {
							const Icon = tech.icon
							return (
								<div key={i} className="group p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:bg-card transition-all duration-200">
									<div className="flex items-center gap-3 mb-2">
										<div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center group-hover:bg-muted transition-colors">
											<Icon className="h-4 w-4 text-foreground/60" />
										</div>
										<div className="text-left flex-1">
											<div className="font-medium text-sm">{tech.name}</div>
											<div className="text-xs text-muted-foreground">{tech.desc}</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Features List */}
				<div className="mt-40 max-w-5xl mx-auto">
					<div className="grid md:grid-cols-2 gap-12">
						<div className="space-y-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
									<PiggyBank className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<h3 className="text-2xl font-semibold tracking-tight">Smart Money Management</h3>
							</div>
							<ul className="space-y-4">
								{[
									{ text: 'Multi-currency accounts (USD, EUR, GBP, SEK)', icon: Globe },
									{ text: 'Real-time currency conversion', icon: Zap },
									{ text: 'Recurring transactions (daily, weekly, monthly, yearly)', icon: Repeat },
									{ text: 'Custom categories and income sources', icon: Tag },
								].map((item, i) => {
									const Icon = item.icon
									return (
										<li key={i} className="flex items-start gap-3">
											<div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Icon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
											</div>
											<span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
										</li>
									)
								})}
							</ul>
						</div>
						<div className="space-y-6">
							<div className="flex items-center gap-3 mb-6">
								<div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
									<LineChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
								</div>
								<h3 className="text-2xl font-semibold tracking-tight">Advanced Analytics</h3>
							</div>
							<ul className="space-y-4">
								{[
									{ text: 'Interactive income vs expense charts', icon: TrendingUp },
									{ text: 'Category breakdown visualizations', icon: BarChart3 },
									{ text: 'Top income sources tracking', icon: Coins },
									{ text: 'Monthly and yearly period analysis', icon: Calendar },
								].map((item, i) => {
									const Icon = item.icon
									return (
										<li key={i} className="flex items-start gap-3">
											<div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
												<Icon className="h-3 w-3 text-amber-600 dark:text-amber-400" />
											</div>
											<span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
										</li>
									)
								})}
							</ul>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="mt-40 p-8 md:p-12 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-center space-y-6">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground mb-2">
						<Rocket className="h-3 w-3" />
						<span>Get Started</span>
					</div>
					<h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
						Ready to Transform Your Financial Management?
					</h2>
					<p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
						Join users who are taking control of their finances with multi-currency support, 
						investment tracking, and AI-powered automation. Start your free account today.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
						<Link href="/signup">
							<Button size="lg" className="h-11 px-6 gap-2 font-medium">
								Create Your Account
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Link href="https://github.com/1Realmoe/FinTrack" target="_blank" rel="noopener noreferrer">
							<Button size="lg" variant="outline" className="h-11 px-6 gap-2 border-border/50">
								<Github className="h-4 w-4" />
								View on GitHub
								<ExternalLink className="h-3.5 w-3.5" />
							</Button>
						</Link>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border/40 mt-40">
				<div className="container mx-auto px-4 py-16">
					<div className="grid md:grid-cols-3 gap-12 mb-12">
						<div className="space-y-4">
							<div className="flex items-center gap-2.5">
								<div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
									<Wallet className="h-4 w-4 text-primary" />
								</div>
								<span className="text-lg font-semibold tracking-tight">FinTrack</span>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
								A smart, multi-currency personal finance manager with investment portfolio tracking and comprehensive analytics.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-sm mb-4 tracking-tight">Features</h4>
							<ul className="space-y-3 text-xs text-muted-foreground">
								{[
									{ text: 'Multi-Currency Support', icon: Globe },
									{ text: 'Investment Tracking', icon: TrendingUp },
									{ text: 'Visual Analytics', icon: BarChart3 },
									{ text: 'Financial Goals', icon: Target },
								].map((item, i) => {
									const Icon = item.icon
									return (
										<li key={i} className="flex items-center gap-2">
											<Icon className="h-3.5 w-3.5" />
											<span>{item.text}</span>
										</li>
									)
								})}
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-sm mb-4 tracking-tight">Resources</h4>
							<ul className="space-y-3 text-xs text-muted-foreground">
								<li>
									<Link href="https://github.com/1Realmoe/FinTrack" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2 group">
										<Github className="h-3.5 w-3.5" />
										<span>GitHub Repository</span>
										<ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
									</Link>
								</li>
								<li>
									<Link href="/signin" className="hover:text-foreground transition-colors flex items-center gap-2">
										<Lock className="h-3.5 w-3.5" />
										<span>Sign In</span>
									</Link>
								</li>
								<li>
									<Link href="/signup" className="hover:text-foreground transition-colors flex items-center gap-2">
										<Rocket className="h-3.5 w-3.5" />
										<span>Get Started</span>
									</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
						<p>&copy; {new Date().getFullYear()} FinTrack by 1Realmoe. All rights reserved.</p>
						<p className="flex items-center gap-1.5">
							<Code2 className="h-3.5 w-3.5" />
							<span>Built with Next.js, TypeScript, and PostgreSQL</span>
						</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

