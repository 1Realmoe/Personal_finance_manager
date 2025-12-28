import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: 'FinTrack - Personal Finance Manager',
		template: '%s | FinTrack',
	},
	description: 'A smart, multi-currency personal finance manager with OCR receipt scanning, investment portfolio tracking, and real-time currency conversion. Track your income, expenses, and financial goals all in one place.',
	keywords: [
		'personal finance',
		'expense tracker',
		'budget manager',
		'investment tracker',
		'multi-currency',
		'financial management',
		'receipt scanner',
		'OCR',
		'portfolio tracker',
	],
	authors: [{ name: '1Realmoe' }],
	creator: '1Realmoe',
	openGraph: {
		type: 'website',
		locale: 'en_US',
		title: 'FinTrack - Personal Finance Manager',
		description: 'A smart, multi-currency personal finance manager with OCR receipt scanning and investment portfolio tracking.',
		siteName: 'FinTrack',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'FinTrack - Personal Finance Manager',
		description: 'A smart, multi-currency personal finance manager with OCR receipt scanning and investment portfolio tracking.',
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
    </ClerkProvider>
  );
}
