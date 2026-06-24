import { UserProfile } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencySelector } from '@/components/features/currency-selector'
import { DeleteAccountButton } from '@/components/features/delete-account-button'

export default async function SettingsPage() {
	const user = await currentUser();
	const isDemoUser = user?.emailAddresses[0]?.emailAddress === 'demo@demo.com';

	return (
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-6 lg:pt-8 space-y-6 sm:space-y-8">
			{isDemoUser && (
				<style dangerouslySetInnerHTML={{ __html: `
					.cl-navbarButton__security,
					.cl-navbarMobileMenuRow__security,
					.cl-accordionTriggerButton__security,
					.cl-profilePage__security,
					.cl-profileSection__password,
					.cl-profileSectionPrimaryButton__password,
					.cl-button__security,
					.cl-button__password {
						display: none !important;
					}
				`}} />
			)}
            <div>
				<h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
				<p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
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
											colorForeground: 'hsl(var(--foreground))',
											colorInput: 'hsl(var(--input))',
											colorInputForeground: 'hsl(var(--foreground))',
											colorMutedForeground: 'hsl(var(--muted-foreground))',
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

				{!isDemoUser ? (
					<Card className="border-destructive">
						<CardHeader>
							<CardTitle className="text-destructive">Danger Zone</CardTitle>
							<CardDescription>Irreversible and destructive actions</CardDescription>
						</CardHeader>
						<CardContent>
							<DeleteAccountButton />
						</CardContent>
					</Card>
				) : (
					<Card className="border-muted/50">
						<CardHeader>
							<CardTitle className="text-muted-foreground">Danger Zone</CardTitle>
							<CardDescription>Actions are disabled for the demo account</CardDescription>
						</CardHeader>
					</Card>
				)}
			</div>
        </div>
    );
}

