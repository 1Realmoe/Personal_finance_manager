'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/auth-helpers'
import { FILE_SIZE_LIMITS } from '@/lib/constants'

export async function uploadReceiptImage(formData: FormData): Promise<{ success: boolean; imageData?: string; error?: string }> {
	try {
		// Verify user is authenticated
		await getCurrentUserId()
		
		const file = formData.get('file') as File | null
		
		if (!file) {
			return { success: false, error: 'No file provided' }
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return { success: false, error: 'File must be an image' }
		}

		// Validate file size (max 5MB for receipts - base64 increases size by ~33%)
		if (file.size > FILE_SIZE_LIMITS.RECEIPT_IMAGE) {
			return { success: false, error: 'File size must be less than 5MB' }
		}

		// Convert image to base64 data URL for storage in database
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		const base64 = buffer.toString('base64')
		const mimeType = file.type || 'image/jpeg'
		const dataUrl = `data:${mimeType};base64,${base64}`

		revalidatePath('/dashboard/transactions')

		return { success: true, imageData: dataUrl }
	} catch (error) {
		console.error('Error uploading receipt:', error)
		return { success: false, error: 'Failed to upload receipt' }
	}
}

export async function uploadCardImage(formData: FormData): Promise<{ success: boolean; path?: string; error?: string }> {
	try {
		// Verify user is authenticated
		await getCurrentUserId()
		
		const file = formData.get('file') as File | null
		
		if (!file) {
			return { success: false, error: 'No file provided' }
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return { success: false, error: 'File must be an image' }
		}

		// Validate file size (max 5MB)
		if (file.size > FILE_SIZE_LIMITS.CARD_IMAGE) {
			return { success: false, error: 'File size must be less than 5MB' }
		}

		// Convert image to base64 data URL for storage in database
		// This works on serverless platforms like Vercel where filesystem is read-only
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		const base64 = buffer.toString('base64')
		const mimeType = file.type || 'image/jpeg'
		const dataUrl = `data:${mimeType};base64,${base64}`

		revalidatePath('/dashboard/accounts')

		return { success: true, path: dataUrl }
	} catch (error) {
		console.error('Error uploading file:', error)
		return { success: false, error: 'Failed to upload file' }
	}
}

