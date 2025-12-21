'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function uploadCardImage(formData: FormData): Promise<{ success: boolean; path?: string; error?: string }> {
	try {
		const file = formData.get('file') as File | null
		
		if (!file) {
			return { success: false, error: 'No file provided' }
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return { success: false, error: 'File must be an image' }
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			return { success: false, error: 'File size must be less than 5MB' }
		}

		// Generate unique filename
		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		
		const timestamp = Date.now()
		const extension = file.name.split('.').pop() || 'jpg'
		const filename = `card-${timestamp}.${extension}`
		const path = join(process.cwd(), 'public', 'uploads', filename)

		// Ensure uploads directory exists
		const fs = await import('fs/promises')
		const uploadsDir = join(process.cwd(), 'public', 'uploads')
		try {
			await fs.access(uploadsDir)
		} catch {
			await fs.mkdir(uploadsDir, { recursive: true })
		}

		// Write file
		await writeFile(path, buffer)

		const publicPath = `/uploads/${filename}`

		revalidatePath('/accounts')

		return { success: true, path: publicPath }
	} catch (error) {
		console.error('Error uploading file:', error)
		return { success: false, error: 'Failed to upload file' }
	}
}

