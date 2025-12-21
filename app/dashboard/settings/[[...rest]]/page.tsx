import { currentUser } from '@clerk/nextjs/server'
import { UserProfile } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencySelector } from '@/components/features/currency-selector'
import { DeleteAccountButton } from '@/components/features/delete-account-button'

export default async function SettingsPage() {
	const user = await currentUser()

	return (
		<div className="p-8 space-y-8">
			<div>
				<h1 className="text-3xl font-bold mb-2">Settings</h1>
				<p className="text-muted-foreground">Manage your account and preferences</p>
			</div>
			<UserProfile routing="path" path="/dashboard/settings" />

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
	)
}

