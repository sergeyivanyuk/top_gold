import { telegramService } from '@/services/telegram/telegram.service'
import { PaymentMethod, PaymentRequest, PaymentResponse, PaymentStatus } from '@/types/payment'
import { PaymentService } from '../payment.service'

const PLATEGA_API_URL = 'https://app.platega.io'

/**
 * Платежный сервис для интеграции с Platega.io
 */
export class PlategaPaymentService extends PaymentService {
	private merchantId: string
	private apiKey: string

	constructor() {
		super()
		this.merchantId = process.env.PLATEGA_MERCHANT_ID || ''
		this.apiKey = process.env.PLATEGA_API_KEY || ''
		if (!this.merchantId || !this.apiKey) {
			console.warn('Platega credentials are missing. Payment will fail.')
		}
	}

	private mapPaymentMethod(method: PaymentMethod): number {
		const mapping: Record<PaymentMethod, number> = {
			[PaymentMethod.SBP]: 2, // СБП / QR
			[PaymentMethod.CARD]: 10, // CardRu (карты МИР)
			[PaymentMethod.INTERNATIONAL]: 12, // Международный эквайринг
			[PaymentMethod.YOOMONEY]: 1, // P2P (требует уточнения)
			[PaymentMethod.QIWI]: 1, // P2P (требует уточнения)
			[PaymentMethod.OTHER]: 1 // P2P (требует уточнения)
		}
		return mapping[method] || 1
	}

	private generateTransactionId(): string {
		// Генерация UUID v4
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0
			const v = c === 'x' ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
	}

	async initPayment(request: PaymentRequest): Promise<PaymentResponse> {
		const transactionId = this.generateTransactionId()
		const amount = request.price
		const paymentMethod = this.mapPaymentMethod(request.paymentMethod)

		const body = {
			paymentMethod,
			id: transactionId,
			paymentDetails: {
				amount,
				currency: 'RUB'
			},
			description: `Оплата тарифа ${request.tariff}`,
			return: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?transaction=${transactionId}`,
			failedUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failed?transaction=${transactionId}`,
			payload: request.nickname || ''
		}

		try {
			const response = await fetch(`${PLATEGA_API_URL}/transaction/process`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-MerchantId': this.merchantId,
					'X-Secret': this.apiKey
				},
				body: JSON.stringify(body)
			})

			const data = await response.json()

			if (!response.ok) {
				console.error('Platega API error:', data)
				throw new Error(data.message || `HTTP ${response.status}`)
			}

			// Успешный ответ
			const paymentUrl = data.redirect || data.paymentUrl
			return {
				paymentId: transactionId,
				status: PaymentStatus.PENDING,
				paymentUrl,
				message: 'Платеж инициирован'
			}
		} catch (error: any) {
			console.error('Failed to init payment with Platega:', error)
			return {
				paymentId: transactionId,
				status: PaymentStatus.FAILED,
				message: error.message || 'Ошибка соединения с платежным шлюзом'
			}
		}
	}

	async checkPayment(paymentId: string): Promise<PaymentStatus> {
		try {
			const response = await fetch(`${PLATEGA_API_URL}/transaction/${paymentId}`, {
				headers: {
					'X-MerchantId': this.merchantId,
					'X-Secret': this.apiKey
				}
			})
			if (!response.ok) {
				return PaymentStatus.FAILED
			}
			const data = await response.json()
			const status = data.status
			const statusMap: Record<string, PaymentStatus> = {
				PENDING: PaymentStatus.PENDING,
				CONFIRMED: PaymentStatus.SUCCESS,
				EXPIRED: PaymentStatus.EXPIRED,
				CANCELED: PaymentStatus.CANCELED,
				FAILED: PaymentStatus.FAILED
			}
			return statusMap[status] || PaymentStatus.PENDING
		} catch (error: any) {
			console.error('Failed to check payment status:', error)
			return PaymentStatus.FAILED
		}
	}

	async handleWebhook(data: any): Promise<{ status: PaymentStatus; paymentId: string }> {
		// В реальности здесь должна быть проверка подписи и обработка данных от Platega
		const paymentId = data.id || data.transactionId
		const status = data.status
		const statusMap: Record<string, PaymentStatus> = {
			CONFIRMED: PaymentStatus.SUCCESS,
			CANCELED: PaymentStatus.CANCELED,
			FAILED: PaymentStatus.FAILED,
			EXPIRED: PaymentStatus.EXPIRED
		}
		const paymentStatus = statusMap[status] || PaymentStatus.PENDING

		// Отправляем уведомление о покупке при успешном платеже
		if (paymentStatus === PaymentStatus.SUCCESS) {
			const amount = data.amount || data.paymentDetails?.amount || 0
			const orderNumber = paymentId
			const paymentTime = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' МСК'
			telegramService.sendPurchaseNotification(amount, orderNumber, paymentTime).catch((err: any) => {
				console.error('Ошибка отправки уведомления о покупке:', err)
			})
		}

		return {
			status: paymentStatus,
			paymentId
		}
	}

	/**
	 * Получение текущего курса обмена для указанного платёжного метода и валюты.
	 * @param paymentMethod - ID платёжного метода (2, 10, 12 и т.д.)
	 * @param currencyFrom - Исходная валюта (например, 'RUB')
	 * @param currencyTo - Целевая валюта (например, 'USDT')
	 * @returns Объект с курсом и временем обновления
	 */
	async getExchangeRate(
		paymentMethod: number,
		currencyFrom: string = 'RUB',
		currencyTo: string = 'USDT'
	): Promise<{
		paymentMethod: number
		currencyFrom: string
		currencyTo: string
		rate: number
		updatedAt: string
	} | null> {
		try {
			const url = new URL(`${PLATEGA_API_URL}/rates/payment_method_rate`)
			url.searchParams.append('merchantId', this.merchantId)
			url.searchParams.append('paymentMethod', paymentMethod.toString())
			url.searchParams.append('currencyFrom', currencyFrom)
			url.searchParams.append('currencyTo', currencyTo)

			const response = await fetch(url.toString(), {
				headers: {
					accept: 'application/json',
					'X-MerchantId': this.merchantId,
					'X-Secret': this.apiKey
				}
			})

			if (!response.ok) {
				console.error('Failed to fetch exchange rate:', response.status)
				return null
			}

			const data = await response.json()
			return data
		} catch (error) {
			console.error('Error fetching exchange rate:', error)
			return null
		}
	}
}
