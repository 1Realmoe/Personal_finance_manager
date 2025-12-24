import { UserProfile } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencySelector } from '@/components/features/currency-selector'
import { DeleteAccountButton } from '@/components/features/delete-account-button'

export default async function SettingsPage() {
	return (
		<div className="p-8 space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">Settings</h1>
				<p className="text-muted-foreground">Manage your account and preferences</p>
			</div>

			<div className="grid gap-8 lg:grid-cols-2">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Account Profile</CardTitle>
							<CardDescription>Manage your personal information and account settings</CardDescription>
						</CardHeader>
						<CardContent className="p-0">
							<div className="clerk-user-profile-wrapper">
								<UserProfile
									routing="path"
									path="/dashboard/settings"
									appearance={{

										variables: {
											colorPrimary: 'hsl(var(--primary))',
											colorBackground: 'hsl(var(--card))',
											colorText: 'hsl(var(--foreground))',
											colorInputBackground: 'hsl(var(--input))',
											colorInputText: 'hsl(var(--foreground))',
											colorTextSecondary: 'hsl(var(--muted-foreground))',
											colorShimmer: 'hsl(var(--muted))',
											colorNeutral: 'hsl(var(--muted))',
											colorDanger: 'hsl(var(--destructive))',
											borderRadius: 'var(--radius)',
										},
										elements: {
											rootBox: 'w-full',
											card: 'bg-transparent shadow-none border-0',
											navbar: 'bg-transparent border-b border-border',
											navbarButton: 'text-foreground hover:bg-muted',
											navbarButtonActive: 'bg-muted text-foreground',
											page: 'bg-transparent',
											pageHeader: 'text-card-foreground',
											pageHeaderTitle: 'text-card-foreground',
											pageHeaderSubtitle: 'text-muted-foreground',
											formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
											formFieldInput: 'bg-input border-border text-foreground',
											formFieldLabel: 'text-foreground',
											accordionTriggerButton: 'text-foreground hover:bg-muted',
											accordionContent: 'text-foreground',
										},
									}}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Preferences</CardTitle>
						<CardDescription>Customize your app preferences</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium mb-2 block">Base Currency</label>
							<CurrencySelector />
						</div>
					</CardContent>
				</Card>

				<Card className="border-destructive">
					<CardHeader>
						<CardTitle className="text-destructive">Danger Zone</CardTitle>
						<CardDescription>Irreversible and destructive actions</CardDescription>
					</CardHeader>
					<CardContent>
						<DeleteAccountButton />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

