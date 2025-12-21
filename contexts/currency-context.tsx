'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/currency'
import { getUserBaseCurrency, updateUserBaseCurrency } from '@/lib/actions/user'

interface CurrencyContextType {
	baseCurrency: CurrencyCode
	setBaseCurrency: (currency: CurrencyCode) => Promise<void>
	isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
	const [baseCurrency, setBaseCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY)
	const [isLoading, setIsLoading] = useState(true)

	// Load base currency from database on mount
	useEffect(() => {
		async function loadBaseCurrency() {
			try {
				const currency = await getUserBaseCurrency()
				setBaseCurrencyState(currency)
			} catch (error) {
				console.error('Error loading base currency:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadBaseCurrency()
	}, [])

	// Update base currency in both state and database
	const setBaseCurrency = async (currency: CurrencyCode) => {
		try {
			await updateUserBaseCurrency(currency)
			setBaseCurrencyState(currency)
		} catch (error) {
			console.error('Error updating base currency:', error)
			throw error
		}
	}

	return (
		<CurrencyContext.Provider value={{ baseCurrency, setBaseCurrency, isLoading }}>
			{children}
		</CurrencyContext.Provider>
	)
}

export function useCurrency() {
	const context = useContext(CurrencyContext)
	if (context === undefined) {
		throw new Error('useCurrency must be used within a CurrencyProvider')
	}
	return context
}

