'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface BalanceVisibilityContextType {
	isBalanceVisible: boolean
	toggleBalanceVisibility: () => void
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType | undefined>(undefined)

export function BalanceVisibilityProvider({ children }: { children: ReactNode }) {
	const [isBalanceVisible, setIsBalanceVisible] = useState(true)
	const [isHydrated, setIsHydrated] = useState(false)

	// Load from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem('balanceVisibility')
		if (stored !== null) {
			setIsBalanceVisible(stored === 'true')
		}
		setIsHydrated(true)
	}, [])

	// Save to localStorage when changed
	const toggleBalanceVisibility = () => {
		setIsBalanceVisible((prev) => {
			const newValue = !prev
			localStorage.setItem('balanceVisibility', String(newValue))
			return newValue
		})
	}

	// Always provide context, even during SSR/hydration
	// Default to visible during SSR to prevent hydration mismatch
	return (
		<BalanceVisibilityContext.Provider value={{ isBalanceVisible, toggleBalanceVisibility }}>
			{children}
		</BalanceVisibilityContext.Provider>
	)
}

export function useBalanceVisibility() {
	const context = useContext(BalanceVisibilityContext)
	if (context === undefined) {
		throw new Error('useBalanceVisibility must be used within a BalanceVisibilityProvider')
	}
	return context
}

