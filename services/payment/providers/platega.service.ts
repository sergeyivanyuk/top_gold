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
			[PaymentMethod.YOOMONEY]: 1, // P2P метод (требует уточнения у Platega)
			[PaymentMethod.QIWI]: 1, // P2P метод (требует уточнения у Platega)
			[PaymentMethod.OTHER]: 1 // P2P метод по умолчанию
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
		const amount = request.price // сумма в рублях (как в документации Platega)
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
			payload: request.nickname || 'guest'
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

				// Обработка специфичных ошибок Platega API
				if (data.statusCode === 400) {
					if (data.message?.includes('No available requisites')) {
						// Для P2P методов рекомендуем суммы 1001, 2002, 3001
						const recommendedAmounts = [1001, 2002, 3001]
						const closestAmount = recommendedAmounts.find(a => a >= amount) || recommendedAmounts[0]

						const errorMessage = `Нет доступных реквизитов для суммы ${amount} RUB. Попробуйте сумму ${closestAmount} RUB или выберите другой метод оплаты.`
						return {
							paymentId: transactionId,
							status: PaymentStatus.FAILED,
							message: errorMessage
						}
					}

					if (data.message?.includes('Transaction already exists')) {
						// Генерируем новый transactionId и повторяем запрос
						const newTransactionId = this.generateTransactionId()
						body.id = newTransactionId

						// В реальном приложении здесь должен быть рекурсивный вызов с лимитом попыток
						return {
							paymentId: newTransactionId,
							status: PaymentStatus.FAILED,
							message: 'Повторите попытку оплаты (конфликт идентификаторов)'
						}
					}

					// Другие ошибки 400
					return {
						paymentId: transactionId,
						status: PaymentStatus.FAILED,
						message: `Ошибка Platega: ${data.message || 'Неизвестная ошибка'}`
					}
				}

				throw new Error(data.message || `HTTP ${response.status}`)
			}

			// Успешный ответ
			// Проверяем наличие redirect или paymentUrl
			const paymentUrl = data.redirect || data.paymentUrl
			if (!paymentUrl) {
				// Если нет redirect, возможно Platega вернул ошибку в успешном ответе
				console.error('Platega response missing redirect/paymentUrl. Full response:', data)

				// Проверяем, есть ли сообщение об ошибке в ответе
				const errorMessage = data.message || data.error || 'Platega не вернул ссылку для оплаты'
				return {
					paymentId: transactionId,
					status: PaymentStatus.FAILED,
					message: `Ошибка Platega: ${errorMessage}. Ответ: ${JSON.stringify(data)}`
				}
			}

			return {
				paymentId: transactionId,
				status: PaymentStatus.PENDING,
				paymentUrl,
				message: 'Платеж инициирован',
				additionalData: {
					expiresIn: data.expiresIn,
					usdtRate: data.usdtRate
				}
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
				EXPIRED: PaymentStatus.FAILED,
				CANCELED: PaymentStatus.CANCELED,
				FAILED: PaymentStatus.FAILED
			}
			return statusMap[status] || PaymentStatus.PENDING
		} catch (error) {
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
			EXPIRED: PaymentStatus.FAILED
		}
		return {
			status: statusMap[status] || PaymentStatus.PENDING,
			paymentId
		}
	}
}
