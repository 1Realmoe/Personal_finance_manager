'use server'

import { db } from '@/db'
import { holdings, investmentTransactions, accounts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'

export async function createHolding(formData: {
	accountId: string
	symbol: string
	assetType: 'STOCK' | 'CRYPTO'
	quantity: string
	averagePurchasePrice: string
	currentPrice: string
	currency: string
}) {
	try {
		const clerkUserId = await getCurrentUserId()

		// Verify account belongs to user and is INVESTMENT type
		const [account] = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.id, formData.accountId),
					eq(accounts.clerkUserId, clerkUserId),
					eq(accounts.type, 'INVESTMENT')
				)
			)
			.limit(1)

		if (!account) {
			return { success: false, error: 'Investment account not found' }
		}

		// Check if holding already exists for this account and symbol
		const [existingHolding] = await db
			.select()
			.from(holdings)
			.where(
				and(
					eq(holdings.accountId, formData.accountId),
					eq(holdings.symbol, formData.symbol),
					eq(holdings.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (existingHolding) {
			return { success: false, error: 'Holding already exists for this symbol' }
		}

		const [holding] = await db
			.insert(holdings)
			.values({
				accountId: formData.accountId,
				symbol: formData.symbol,
				assetType: formData.assetType,
				quantity: formData.quantity,
				averagePurchasePrice: formData.averagePurchasePrice,
				currentPrice: formData.currentPrice,
				currency: formData.currency,
				clerkUserId,
			})
			.returning()

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true, holding }
	} catch (error) {
		console.error('Error creating holding:', error)
		return { success: false, error: 'Failed to create holding' }
	}
}

export async function updateHolding(
	holdingId: string,
	formData: {
		quantity?: string
		averagePurchasePrice?: string
		currentPrice?: string
		currency?: string
	}
) {
	try {
		const clerkUserId = await getCurrentUserId()

		// Verify holding belongs to user
		const [existingHolding] = await db
			.select()
			.from(holdings)
			.where(
				and(
					eq(holdings.id, holdingId),
					eq(holdings.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!existingHolding) {
			return { success: false, error: 'Holding not found' }
		}

		const updateData: {
			quantity?: string
			averagePurchasePrice?: string
			currentPrice?: string
			currency?: string
			updatedAt?: Date
		} = {
			updatedAt: new Date(),
		}

		if (formData.quantity !== undefined) {
			updateData.quantity = formData.quantity
		}
		if (formData.averagePurchasePrice !== undefined) {
			updateData.averagePurchasePrice = formData.averagePurchasePrice
		}
		if (formData.currentPrice !== undefined) {
			updateData.currentPrice = formData.currentPrice
		}
		if (formData.currency !== undefined) {
			updateData.currency = formData.currency
		}

		const [holding] = await db
			.update(holdings)
			.set(updateData)
			.where(
				and(
					eq(holdings.id, holdingId),
					eq(holdings.clerkUserId, clerkUserId)
				)
			)
			.returning()

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true, holding }
	} catch (error) {
		console.error('Error updating holding:', error)
		return { success: false, error: 'Failed to update holding' }
	}
}

export async function deleteHolding(holdingId: string) {
	try {
		const clerkUserId = await getCurrentUserId()

		// Verify holding belongs to user
		const [existingHolding] = await db
			.select()
			.from(holdings)
			.where(
				and(
					eq(holdings.id, holdingId),
					eq(holdings.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!existingHolding) {
			return { success: false, error: 'Holding not found' }
		}

		await db
			.delete(holdings)
			.where(
				and(
					eq(holdings.id, holdingId),
					eq(holdings.clerkUserId, clerkUserId)
				)
			)

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true }
	} catch (error) {
		console.error('Error deleting holding:', error)
		return { success: false, error: 'Failed to delete holding' }
	}
}

export async function createInvestmentTransaction(formData: {
	accountId: string
	holdingId?: string | null
	type: 'BUY' | 'SELL'
	symbol: string
	assetType: 'STOCK' | 'CRYPTO'
	quantity: string
	price: string
	date: Date
	currency: string
}) {
	try {
		const clerkUserId = await getCurrentUserId()

		// Verify account belongs to user and is INVESTMENT type
		const [account] = await db
			.select()
			.from(accounts)
			.where(
				and(
					eq(accounts.id, formData.accountId),
					eq(accounts.clerkUserId, clerkUserId),
					eq(accounts.type, 'INVESTMENT')
				)
			)
			.limit(1)

		if (!account) {
			return { success: false, error: 'Investment account not found' }
		}

		// Create transaction record
		const [transaction] = await db
			.insert(investmentTransactions)
			.values({
				accountId: formData.accountId,
				holdingId: formData.holdingId || null,
				type: formData.type,
				symbol: formData.symbol,
				quantity: formData.quantity,
				price: formData.price,
				date: formData.date,
				currency: formData.currency,
				clerkUserId,
			})
			.returning()

		// Update or create holding
		if (formData.type === 'BUY') {
			const [existingHolding] = await db
				.select()
				.from(holdings)
				.where(
					and(
						eq(holdings.accountId, formData.accountId),
						eq(holdings.symbol, formData.symbol),
						eq(holdings.clerkUserId, clerkUserId)
					)
				)
				.limit(1)

			const quantity = parseFloat(formData.quantity)
			const price = parseFloat(formData.price)

			if (existingHolding) {
				// Update existing holding
				const oldQuantity = parseFloat(existingHolding.quantity || '0')
				const oldAvgPrice = parseFloat(existingHolding.averagePurchasePrice || '0')
				const totalOldCost = oldQuantity * oldAvgPrice
				const newCost = quantity * price
				const newQuantity = oldQuantity + quantity
				const newAvgPrice = newQuantity > 0 ? (totalOldCost + newCost) / newQuantity : price

				await db
					.update(holdings)
					.set({
						quantity: newQuantity.toString(),
						averagePurchasePrice: newAvgPrice.toString(),
						updatedAt: new Date(),
					})
					.where(eq(holdings.id, existingHolding.id))
			} else {
				// Create new holding
				await db
					.insert(holdings)
					.values({
						accountId: formData.accountId,
						symbol: formData.symbol,
						assetType: formData.assetType,
						quantity: formData.quantity,
						averagePurchasePrice: formData.price,
						currentPrice: formData.price,
						currency: formData.currency,
						clerkUserId,
					})
			}
		} else if (formData.type === 'SELL') {
			// Update holding quantity
			if (formData.holdingId) {
				const [holding] = await db
					.select()
					.from(holdings)
					.where(
						and(
							eq(holdings.id, formData.holdingId),
							eq(holdings.clerkUserId, clerkUserId)
						)
					)
					.limit(1)

				if (holding) {
					const oldQuantity = parseFloat(holding.quantity || '0')
					const sellQuantity = parseFloat(formData.quantity)
					const newQuantity = Math.max(0, oldQuantity - sellQuantity)

					if (newQuantity === 0) {
						// Delete holding if quantity reaches zero
						await db
							.delete(holdings)
							.where(eq(holdings.id, formData.holdingId))
					} else {
						await db
							.update(holdings)
							.set({
								quantity: newQuantity.toString(),
								updatedAt: new Date(),
							})
							.where(eq(holdings.id, formData.holdingId))
					}
				}
			}
		}

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true, transaction }
	} catch (error) {
		console.error('Error creating investment transaction:', error)
		return { success: false, error: 'Failed to create investment transaction' }
	}
}

export async function updateCurrentPrice(holdingId: string, currentPrice: string) {
	try {
		const clerkUserId = await getCurrentUserId()

		const [holding] = await db
			.update(holdings)
			.set({
				currentPrice,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(holdings.id, holdingId),
					eq(holdings.clerkUserId, clerkUserId)
				)
			)
			.returning()

		if (!holding) {
			return { success: false, error: 'Holding not found' }
		}

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true, holding }
	} catch (error) {
		console.error('Error updating current price:', error)
		return { success: false, error: 'Failed to update current price' }
	}
}

export async function updateInvestmentTransaction(
	transactionId: string,
	formData: {
		type: 'BUY' | 'SELL'
		symbol: string
		assetType: 'STOCK' | 'CRYPTO'
		quantity: string
		price: string
		date: Date
		currency: string
		holdingId?: string | null
	}
) {
	try {
		const clerkUserId = await getCurrentUserId()

		// Get the old transaction to reverse its effects
		const [oldTransaction] = await db
			.select()
			.from(investmentTransactions)
			.where(
				and(
					eq(investmentTransactions.id, transactionId),
					eq(investmentTransactions.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!oldTransaction) {
			return { success: false, error: 'Transaction not found' }
		}

		// Reverse the old transaction's effect on holdings
		if (oldTransaction.type === 'BUY') {
			// Reverse: remove quantity and recalculate average price
			const [oldHolding] = await db
				.select()
				.from(holdings)
				.where(
					and(
						eq(holdings.accountId, oldTransaction.accountId),
						eq(holdings.symbol, oldTransaction.symbol),
						eq(holdings.clerkUserId, clerkUserId)
					)
				)
				.limit(1)

			if (oldHolding) {
				const oldQuantity = parseFloat(oldHolding.quantity || '0')
				const oldAvgPrice = parseFloat(oldHolding.averagePurchasePrice || '0')
				const oldTotalCost = oldQuantity * oldAvgPrice
				const removedQuantity = parseFloat(oldTransaction.quantity || '0')
				const removedCost = removedQuantity * parseFloat(oldTransaction.price || '0')
				const newQuantity = oldQuantity - removedQuantity

				if (newQuantity <= 0) {
					// Delete holding if quantity becomes zero or negative
					await db.delete(holdings).where(eq(holdings.id, oldHolding.id))
				} else {
					const newAvgPrice = newQuantity > 0 ? (oldTotalCost - removedCost) / newQuantity : 0
					await db
						.update(holdings)
						.set({
							quantity: newQuantity.toString(),
							averagePurchasePrice: newAvgPrice.toString(),
							updatedAt: new Date(),
						})
						.where(eq(holdings.id, oldHolding.id))
				}
			}
		} else if (oldTransaction.type === 'SELL') {
			// Reverse: add back quantity
			if (oldTransaction.holdingId) {
				const [oldHolding] = await db
					.select()
					.from(holdings)
					.where(eq(holdings.id, oldTransaction.holdingId))
					.limit(1)

				if (oldHolding) {
					const oldQuantity = parseFloat(oldHolding.quantity || '0')
					const addedQuantity = parseFloat(oldTransaction.quantity || '0')
					const newQuantity = oldQuantity + addedQuantity

					await db
						.update(holdings)
						.set({
							quantity: newQuantity.toString(),
							updatedAt: new Date(),
						})
						.where(eq(holdings.id, oldTransaction.holdingId))
				} else {
					// Recreate holding if it was deleted - try to find original asset type from existing holdings
					const [existingHolding] = await db
						.select()
						.from(holdings)
						.where(
							and(
								eq(holdings.accountId, oldTransaction.accountId),
								eq(holdings.symbol, oldTransaction.symbol),
								eq(holdings.clerkUserId, clerkUserId)
							)
						)
						.limit(1)
					
					await db.insert(holdings).values({
						accountId: oldTransaction.accountId,
						symbol: oldTransaction.symbol,
						assetType: existingHolding?.assetType || formData.assetType,
						quantity: oldTransaction.quantity,
						averagePurchasePrice: oldTransaction.price,
						currentPrice: oldTransaction.price,
						currency: oldTransaction.currency,
						clerkUserId,
					})
				}
			}
		}

		// Update the transaction
		const [updatedTransaction] = await db
			.update(investmentTransactions)
			.set({
				type: formData.type,
				symbol: formData.symbol,
				quantity: formData.quantity,
				price: formData.price,
				date: formData.date,
				currency: formData.currency,
				holdingId: formData.holdingId || null,
			})
			.where(
				and(
					eq(investmentTransactions.id, transactionId),
					eq(investmentTransactions.clerkUserId, clerkUserId)
				)
			)
			.returning()

		if (!updatedTransaction) {
			return { success: false, error: 'Failed to update transaction' }
		}

		// Apply the new transaction's effect on holdings
		if (formData.type === 'BUY') {
			const [existingHolding] = await db
				.select()
				.from(holdings)
				.where(
					and(
						eq(holdings.accountId, updatedTransaction.accountId),
						eq(holdings.symbol, formData.symbol),
						eq(holdings.clerkUserId, clerkUserId)
					)
				)
				.limit(1)

			const quantity = parseFloat(formData.quantity)
			const price = parseFloat(formData.price)

			if (existingHolding) {
				const oldQuantity = parseFloat(existingHolding.quantity || '0')
				const oldAvgPrice = parseFloat(existingHolding.averagePurchasePrice || '0')
				const totalOldCost = oldQuantity * oldAvgPrice
				const newCost = quantity * price
				const newQuantity = oldQuantity + quantity
				const newAvgPrice = newQuantity > 0 ? (totalOldCost + newCost) / newQuantity : price

				await db
					.update(holdings)
					.set({
						quantity: newQuantity.toString(),
						averagePurchasePrice: newAvgPrice.toString(),
						updatedAt: new Date(),
					})
					.where(eq(holdings.id, existingHolding.id))
			} else {
				await db.insert(holdings).values({
					accountId: updatedTransaction.accountId,
					symbol: formData.symbol,
					assetType: formData.assetType,
					quantity: formData.quantity,
					averagePurchasePrice: formData.price,
					currentPrice: formData.price,
					currency: formData.currency,
					clerkUserId,
				})
			}
		} else if (formData.type === 'SELL') {
			if (formData.holdingId) {
				const [holding] = await db
					.select()
					.from(holdings)
					.where(
						and(
							eq(holdings.id, formData.holdingId),
							eq(holdings.clerkUserId, clerkUserId)
						)
					)
					.limit(1)

				if (holding) {
					const oldQuantity = parseFloat(holding.quantity || '0')
					const sellQuantity = parseFloat(formData.quantity)
					const newQuantity = Math.max(0, oldQuantity - sellQuantity)

					if (newQuantity === 0) {
						await db.delete(holdings).where(eq(holdings.id, formData.holdingId))
					} else {
						await db
							.update(holdings)
							.set({
								quantity: newQuantity.toString(),
								updatedAt: new Date(),
							})
							.where(eq(holdings.id, formData.holdingId))
					}
				}
			}
		}

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true, transaction: updatedTransaction }
	} catch (error) {
		console.error('Error updating investment transaction:', error)
		return { success: false, error: 'Failed to update investment transaction' }
	}
}

export async function deleteInvestmentTransaction(transactionId: string) {
	try {
		const clerkUserId = await getCurrentUserId()

		// Get the transaction to reverse its effects
		const [transaction] = await db
			.select()
			.from(investmentTransactions)
			.where(
				and(
					eq(investmentTransactions.id, transactionId),
					eq(investmentTransactions.clerkUserId, clerkUserId)
				)
			)
			.limit(1)

		if (!transaction) {
			return { success: false, error: 'Transaction not found' }
		}

		// Reverse the transaction's effect on holdings
		if (transaction.type === 'BUY') {
			// Reverse: remove quantity and recalculate average price
			const [holding] = await db
				.select()
				.from(holdings)
				.where(
					and(
						eq(holdings.accountId, transaction.accountId),
						eq(holdings.symbol, transaction.symbol),
						eq(holdings.clerkUserId, clerkUserId)
					)
				)
				.limit(1)

			if (holding) {
				const oldQuantity = parseFloat(holding.quantity || '0')
				const oldAvgPrice = parseFloat(holding.averagePurchasePrice || '0')
				const oldTotalCost = oldQuantity * oldAvgPrice
				const removedQuantity = parseFloat(transaction.quantity || '0')
				const removedCost = removedQuantity * parseFloat(transaction.price || '0')
				const newQuantity = oldQuantity - removedQuantity

				if (newQuantity <= 0) {
					// Delete holding if quantity becomes zero or negative
					await db.delete(holdings).where(eq(holdings.id, holding.id))
				} else {
					const newAvgPrice = newQuantity > 0 ? (oldTotalCost - removedCost) / newQuantity : 0
					await db
						.update(holdings)
						.set({
							quantity: newQuantity.toString(),
							averagePurchasePrice: newAvgPrice.toString(),
							updatedAt: new Date(),
						})
						.where(eq(holdings.id, holding.id))
				}
			}
		} else if (transaction.type === 'SELL') {
			// Reverse: add back quantity
			if (transaction.holdingId) {
				const [holding] = await db
					.select()
					.from(holdings)
					.where(eq(holdings.id, transaction.holdingId))
					.limit(1)

				if (holding) {
					const oldQuantity = parseFloat(holding.quantity || '0')
					const addedQuantity = parseFloat(transaction.quantity || '0')
					const newQuantity = oldQuantity + addedQuantity

					await db
						.update(holdings)
						.set({
							quantity: newQuantity.toString(),
							updatedAt: new Date(),
						})
						.where(eq(holdings.id, transaction.holdingId))
				} else {
					// Recreate holding if it was deleted - try to find original asset type from existing holdings
					const [existingHolding] = await db
						.select()
						.from(holdings)
						.where(
							and(
								eq(holdings.accountId, transaction.accountId),
								eq(holdings.symbol, transaction.symbol),
								eq(holdings.clerkUserId, clerkUserId)
							)
						)
						.limit(1)
					
					await db.insert(holdings).values({
						accountId: transaction.accountId,
						symbol: transaction.symbol,
						assetType: existingHolding?.assetType || 'STOCK', // Fallback to STOCK if not found
						quantity: transaction.quantity,
						averagePurchasePrice: transaction.price,
						currentPrice: transaction.price,
						currency: transaction.currency,
						clerkUserId,
					})
				}
			}
		}

		// Delete the transaction
		await db
			.delete(investmentTransactions)
			.where(
				and(
					eq(investmentTransactions.id, transactionId),
					eq(investmentTransactions.clerkUserId, clerkUserId)
				)
			)

		revalidatePath('/dashboard/investments')
		revalidatePath('/dashboard')

		return { success: true }
	} catch (error) {
		console.error('Error deleting investment transaction:', error)
		return { success: false, error: 'Failed to delete investment transaction' }
	}
}

