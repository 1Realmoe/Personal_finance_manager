'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReceiptData {
	amount?: string
	description?: string
	date?: Date
	currency?: string
	merchant?: string
	imageData?: string // Base64 data URL of the scanned receipt image
}

interface ReceiptScannerProps {
	onScanComplete: (data: ReceiptData) => void
	onClose?: () => void
}

export function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
	const [isScanning, setIsScanning] = useState(false)
	const [preview, setPreview] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setError('Please select an image file')
			return
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			setError('File size must be less than 10MB')
			return
		}

		setError(null)
		setIsScanning(true)

		try {
			// Create preview and get base64 data URL
			const imageDataUrl = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader()
				reader.onloadend = () => {
					const result = reader.result as string
					setPreview(result)
					resolve(result)
				}
				reader.onerror = reject
				reader.readAsDataURL(file)
			})

			// Process with Tesseract.js
			const Tesseract = await import('tesseract.js')
			const { data } = await Tesseract.recognize(file, 'eng', {
				logger: (m) => {
					if (m.status === 'recognizing text') {
						// Progress updates can be shown here if needed
					}
				},
			})

			// Parse extracted text
			const extractedData = parseReceiptText(data.text)
			// Include the image data URL so it can be attached to the transaction
			extractedData.imageData = imageDataUrl
			onScanComplete(extractedData)
		} catch (err) {
			console.error('Error scanning receipt:', err)
			setError('Failed to scan receipt. Please try again.')
		} finally {
			setIsScanning(false)
		}
	}

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const handleClear = () => {
		setPreview(null)
		setError(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					className="hidden"
				/>

				{preview ? (
					<div className="space-y-3">
						<div className="relative rounded-lg border border-border overflow-hidden bg-muted/50">
							<img
								src={preview}
								alt="Receipt preview"
								className="w-full h-auto max-h-64 object-contain"
							/>
							{isScanning && (
								<div className="absolute inset-0 bg-background/80 flex items-center justify-center">
									<div className="flex flex-col items-center gap-2">
										<Loader2 className="h-8 w-8 animate-spin text-primary" />
										<p className="text-sm text-muted-foreground">Scanning receipt...</p>
									</div>
								</div>
							)}
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={handleClear}
								disabled={isScanning}
								className="flex-1"
							>
								<X className="mr-2 h-4 w-4" />
								Clear
							</Button>
							<Button
								onClick={handleClick}
								disabled={isScanning}
								className="flex-1"
							>
								<Upload className="mr-2 h-4 w-4" />
								Change Image
							</Button>
						</div>
					</div>
				) : (
					<div
						onClick={handleClick}
						className={cn(
							'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
							'transition-colors hover:border-primary hover:bg-primary/5',
							isScanning && 'opacity-50 cursor-not-allowed'
						)}
					>
						<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-sm font-medium mb-1">Click to upload receipt</p>
						<p className="text-xs text-muted-foreground">
							Supports JPG, PNG, and other image formats
						</p>
					</div>
				)}

				{error && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}
			</div>
		</div>
	)
}

/**
 * Parse receipt text to extract transaction information
 */
function parseReceiptText(text: string): ReceiptData {
	const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
	const data: ReceiptData = {}

	// Extract amount (look for patterns like $XX.XX, XX.XX, TOTAL, etc.)
	// Prioritize amounts near "total" keywords and filter out change/cash received
	
	// Keywords that indicate a total (in multiple languages)
	const totalKeywords = [
		'total', 'totalt', 'summa', 'sum', 'belopp', 'amount', 'balance', 'due', 'paid',
		'totala', 'totale', 'gesamt', 'montant', 'importo'
	]
	
	// Keywords that indicate change or cash received (should be ignored)
	const ignoreKeywords = [
		'change', 'åter', 'return', 'mottaget', 'received', 'cash', 'kontant',
		'vissel', 'rest', 'tilbage', 'zurück', 'betalt', 'paid'
	]
	
	// Keywords that indicate rounding or small adjustments (should be ignored)
	const roundingKeywords = [
		'rounding', 'avrundning', 'öresavrundning', 'round', 'adjustment', 'justering'
	]

	// First, try to find amounts near total keywords (highest priority)
	// Check line by line for better accuracy
	let totalAmount: { value: number; str: string } | null = null
	
	// Method 1: Look for total keyword and amount on the same line
	for (const line of lines) {
		const lowerLine = line.toLowerCase()
		for (const keyword of totalKeywords) {
			if (lowerLine.includes(keyword)) {
				// Check if this line contains rounding keywords (skip if so)
				const hasRounding = roundingKeywords.some(roundWord => lowerLine.includes(roundWord))
				if (hasRounding) continue
				
				// Find ALL amounts on this line, then pick the largest reasonable one
				const amountPattern = /([\d\s,]+[.,]\d{1,2})/g
				const matches = [...line.matchAll(amountPattern)]
				const lineAmounts: Array<{ value: number; str: string }> = []
				
				for (const match of matches) {
					let amountStr = match[1].replace(/[\s]/g, '').trim()
					if (amountStr.includes(',') && !amountStr.includes('.')) {
						amountStr = amountStr.replace(',', '.')
					} else if (amountStr.includes(',')) {
						amountStr = amountStr.replace(/,/g, '')
					}
					
					const amountValue = parseFloat(amountStr)
					// Filter: must be at least 1.00 and less than 1000000
					// Also check if it's near a rounding keyword in the line
					const matchIndex = match.index || 0
					const contextAround = line.substring(Math.max(0, matchIndex - 20), Math.min(line.length, matchIndex + 20)).toLowerCase()
					const nearRounding = roundingKeywords.some(roundWord => contextAround.includes(roundWord))
					
					if (amountValue >= 1.00 && amountValue < 1000000 && !nearRounding) {
						lineAmounts.push({ value: amountValue, str: amountStr })
					}
				}
				
				// If we found amounts on this line, use the largest one
				if (lineAmounts.length > 0) {
					lineAmounts.sort((a, b) => b.value - a.value)
					totalAmount = lineAmounts[0]
					break
				}
				
				// Also check next line if current line only has keyword
				if (!totalAmount && line.length < 30) {
					const lineIndex = lines.indexOf(line)
					if (lineIndex < lines.length - 1) {
						const nextLine = lines[lineIndex + 1]
						const nextLineLower = nextLine.toLowerCase()
						const nextHasRounding = roundingKeywords.some(roundWord => nextLineLower.includes(roundWord))
						
						if (!nextHasRounding) {
							const amountMatch = nextLine.match(/([\d\s,]+[.,]\d{1,2})/)
							if (amountMatch) {
								let amountStr = amountMatch[1].replace(/[\s]/g, '').trim()
								if (amountStr.includes(',') && !amountStr.includes('.')) {
									amountStr = amountStr.replace(',', '.')
								} else if (amountStr.includes(',')) {
									amountStr = amountStr.replace(/,/g, '')
								}
								const amountValue = parseFloat(amountStr)
								if (amountValue >= 1.00 && amountValue < 1000000) {
									totalAmount = { value: amountValue, str: amountStr }
									break
								}
							}
						}
					}
				}
			}
			if (totalAmount) break
		}
		if (totalAmount) break
	}
	
	// Method 2: If not found, try regex pattern matching on full text
	if (!totalAmount) {
		for (const keyword of totalKeywords) {
			// More flexible pattern: keyword followed by optional spaces/colons, optional currency, then amount
			const keywordPattern = new RegExp(`(${keyword})[\\s:]*[\\$€£¥kr]?[\\s]*([\\d\\s,]+[.,]\\d{1,2})`, 'gi')
			const matches = [...text.matchAll(keywordPattern)]
			for (const match of matches) {
				// Normalize the amount string: remove spaces, handle comma as decimal separator
				let amountStr = match[2].replace(/[\s]/g, '').trim()
				if (amountStr.includes(',') && !amountStr.includes('.')) {
					amountStr = amountStr.replace(',', '.')
				} else if (amountStr.includes(',')) {
					amountStr = amountStr.replace(/,/g, '')
				}
				
				const amountValue = parseFloat(amountStr)
				// Must be at least 1.00 to be considered a valid total
				if (amountValue >= 1.00 && amountValue < 1000000) {
					// Check if this amount is near an ignore keyword (should skip)
					const matchIndex = match.index || 0
					const contextBefore = text.substring(Math.max(0, matchIndex - 50), matchIndex).toLowerCase()
					const contextAfter = text.substring(matchIndex, Math.min(text.length, matchIndex + 100)).toLowerCase()
					const shouldIgnore = ignoreKeywords.some(ignoreWord => 
						contextBefore.includes(ignoreWord) || contextAfter.includes(ignoreWord)
					) || roundingKeywords.some(roundWord =>
						contextBefore.includes(roundWord) || contextAfter.includes(roundWord)
					)
					
					if (!shouldIgnore) {
						totalAmount = { value: amountValue, str: amountStr }
						break
					}
				}
			}
			if (totalAmount) break
		}
	}

	// If we found a total amount, use it
	if (totalAmount) {
		data.amount = totalAmount.str
	} else {
		// Fallback: find all amounts and filter intelligently
		// Handle both . and , as decimal separators
		const amountPattern = /([\d\s,]+[.,]\d{1,2})/g
		const matches = [...text.matchAll(amountPattern)]
		const amounts: Array<{ value: number; str: string; context: string }> = []

		for (const match of matches) {
			// Normalize the amount string
			let amountStr = match[1].replace(/[\s]/g, '').trim()
			if (amountStr.includes(',') && !amountStr.includes('.')) {
				amountStr = amountStr.replace(',', '.')
			} else if (amountStr.includes(',')) {
				amountStr = amountStr.replace(/,/g, '')
			}
			
			const amountValue = parseFloat(amountStr)
			// Must be at least 1.00 to be considered a valid total
			if (amountValue >= 1.00 && amountValue < 1000000) {
				const matchIndex = match.index || 0
				const context = text.substring(Math.max(0, matchIndex - 30), Math.min(text.length, matchIndex + 50)).toLowerCase()
				
				// Skip if near ignore keywords or rounding keywords
				const shouldIgnore = ignoreKeywords.some(ignoreWord => context.includes(ignoreWord)) ||
					roundingKeywords.some(roundWord => context.includes(roundWord))
				if (!shouldIgnore) {
					amounts.push({ value: amountValue, str: amountStr, context })
				}
			}
		}

		// If we have amounts, prefer the one that's near a total keyword, otherwise use the largest reasonable amount
		if (amounts.length > 0) {
			// Look for amounts near total keywords
			const totalNearAmounts = amounts.filter(amt => 
				totalKeywords.some(keyword => amt.context.includes(keyword))
			)
			
			if (totalNearAmounts.length > 0) {
				// If multiple amounts near "total", pick the largest one
				totalNearAmounts.sort((a, b) => b.value - a.value)
				data.amount = totalNearAmounts[0].str
			} else {
				// Sort by value (descending) to prioritize larger amounts
				amounts.sort((a, b) => b.value - a.value)
				// Filter out very large amounts (likely cash received) and very small amounts
				// Also filter out amounts that are too small to be a total (likely item prices)
				const reasonableAmounts = amounts.filter(amt => 
					amt.value < 10000 && 
					amt.value >= 10 && // Minimum reasonable total (filter out small item prices like 2.52)
					amt.value < 5000 // Maximum reasonable total for most receipts
				)
				if (reasonableAmounts.length > 0) {
					// Take the largest reasonable amount (most likely to be the total)
					data.amount = reasonableAmounts[0].str
				} else {
					// If no reasonable amounts, try a wider range but still exclude very small
					const widerRange = amounts.filter(amt => amt.value >= 10 && amt.value < 10000)
					if (widerRange.length > 0) {
						// Take the largest from wider range
						data.amount = widerRange[0].str
					} else if (amounts.length > 0) {
						// Last resort: use the largest amount found (even if outside normal range)
						data.amount = amounts[0].str
					}
				}
			}
		}
	}

	// Extract date (look for date patterns)
	const datePatterns = [
		/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
		/(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
		/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/i,
		/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
	]

	for (const pattern of datePatterns) {
		const match = text.match(pattern)
		if (match) {
			try {
				const dateStr = match[1]
				const parsedDate = new Date(dateStr)
				// Validate date is reasonable (not too far in past/future)
				const now = new Date()
				const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
				const oneYearAhead = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
				
				if (!isNaN(parsedDate.getTime()) && parsedDate >= fiveYearsAgo && parsedDate <= oneYearAhead) {
					data.date = parsedDate
					break
				}
			} catch {
				// Invalid date, continue
			}
		}
	}

	// If no date found, default to today
	if (!data.date) {
		data.date = new Date()
	}

	// Extract merchant name (usually first line or line with store name)
	const merchantKeywords = [
		'store', 'shop', 'market', 'restaurant', 'cafe', 'supermarket', 'retail', 'outlet',
		'butik', 'affär', 'handel', 'restaurang', 'kafé', 'hemma' // Swedish keywords
	]
	
	// Words/phrases that indicate slogans or marketing text (should be skipped)
	const sloganPatterns = [
		'för', 'prisjägare', 'price', 'hunter', 'matmarknad', 'food market',
		'välkommen', 'welcome', 'org.nr', 'tele', 'orgnr', 'telefon',
		'organisationsnummer', 'organization number'
	]
	
	// Patterns that indicate garbage/not a merchant name
	const garbagePatterns = [
		/^[\/\\;:]+/, // Starts with special chars
		/^[\d\s\/\\;:]+$/, // Only numbers and special chars
		/^[^a-zA-ZåäöÅÄÖ]{3,}$/, // No letters (Swedish chars included)
	]
	
	// Prioritize first 3 lines (most likely to contain store name)
	const priorityLines = lines.slice(0, 3)
	const otherLines = lines.slice(3, 10)
	
	// Function to check if a line looks like a merchant name
	const isMerchantName = (line: string): boolean => {
		const lowerLine = line.toLowerCase()
		
		// Skip if it's a slogan
		if (sloganPatterns.some(pattern => lowerLine.includes(pattern))) {
			return false
		}
		
		// Skip if it looks like an address, phone, or org number
		if (line.match(/\d{3,}/) && line.length > 25) return false
		if (line.match(/^\d{1,2}[\/\-]\d{1,2}/)) return false // Date-like
		if (garbagePatterns.some(pattern => pattern.test(line))) return false
		
		// Check if it looks like a business name
		const hasMerchantKeyword = merchantKeywords.some((keyword) => lowerLine.includes(keyword))
		const looksLikeBusinessName = (
			line.length > 2 && 
			line.length < 50 && // Store names are usually shorter
			!line.match(/^\d/) && 
			!lowerLine.includes('tax') && 
			!lowerLine.includes('moms') &&
			!lowerLine.includes('subtotal') &&
			!lowerLine.includes('totalt') &&
			!lowerLine.includes('öppettider') &&
			!lowerLine.includes('spara') &&
			!lowerLine.includes('kvitto') &&
			/[a-zA-ZåäöÅÄÖ]{2,}/.test(line) // Contains letters
		)
		
		return hasMerchantKeyword || looksLikeBusinessName
	}
	
	// First, check priority lines (first 3 lines)
	for (const line of priorityLines) {
		if (isMerchantName(line)) {
			let merchant = line.replace(/\s+/g, ' ').trim()
			merchant = merchant.replace(/^[#\*\/\\;:~]+/, '').trim()
			merchant = merchant.replace(/[\/\\;:]+$/, '').trim()
			merchant = merchant.replace(/[~]+$/, '').trim()
			
			if (merchant.length > 2 && /[a-zA-ZåäöÅÄÖ]{2,}/.test(merchant)) {
				data.merchant = merchant
				data.description = merchant
				break
			}
		}
	}
	
	// If not found in priority lines, check other lines
	if (!data.description) {
		for (const line of otherLines) {
			if (isMerchantName(line)) {
				let merchant = line.replace(/\s+/g, ' ').trim()
				merchant = merchant.replace(/^[#\*\/\\;:~]+/, '').trim()
				merchant = merchant.replace(/[\/\\;:]+$/, '').trim()
				merchant = merchant.replace(/[~]+$/, '').trim()
				
				if (merchant.length > 2 && /[a-zA-ZåäöÅÄÖ]{2,}/.test(merchant)) {
					data.merchant = merchant
					data.description = merchant
					break
				}
			}
		}
	}

	// If no merchant found, use first substantial non-empty line as description
	if (!data.description && lines.length > 0) {
		for (const line of lines) {
			// Skip lines that are clearly not merchant names
			const lowerLine = line.toLowerCase()
			if (
				line.length > 3 &&
				line.length < 100 &&
				!line.match(/^\d/) &&
				!lowerLine.includes('tax') &&
				!lowerLine.includes('moms') &&
				!lowerLine.includes('total') &&
				!lowerLine.includes('subtotal') &&
				!lowerLine.includes('totalt') &&
				!lowerLine.includes('öppettider') &&
				!lowerLine.includes('spara') &&
				!lowerLine.includes('kvitto') &&
				!line.match(/^\d{1,2}[\/\-]/) &&
				!/^[\/\\;:~]+/.test(line) && // Not starting with special chars
				/[a-zA-ZåäöÅÄÖ]{2,}/.test(line) // Contains letters
			) {
				let desc = line.replace(/^[\/\\;:~]+/, '').trim()
				desc = desc.replace(/[~]+$/, '').trim()
				data.description = desc
				break
			}
		}
	}

	// Extract currency (look for currency symbols or codes)
	const currencyMap: Record<string, string> = {
		'$': 'USD',
		'USD': 'USD',
		'€': 'EUR',
		'EUR': 'EUR',
		'£': 'GBP',
		'GBP': 'GBP',
		'¥': 'JPY',
		'JPY': 'JPY',
		'CAD': 'CAD',
		'AUD': 'AUD',
	}

	for (const [symbol, code] of Object.entries(currencyMap)) {
		const regex = new RegExp(`\\${symbol}|${code}`, 'i')
		if (regex.test(text)) {
			data.currency = code
			break
		}
	}

	return data
}

