import { PaymentRequest, PaymentResponse, PaymentStatus } from '@/types/payment'

/**
 * Абстрактный класс платежного сервиса.
 * Конкретные реализации для разных провайдеров (ЮKassa, CloudPayments, etc.)
 */
export abstract class PaymentService {
	abstract initPayment(request: PaymentRequest): Promise<PaymentResponse>
	abstract checkPayment(paymentId: string): Promise<PaymentStatus>
	abstract handleWebhook(data: any): Promise<{ status: PaymentStatus; paymentId: string }>
}

/**
 * Тестовый платежный сервис для разработки.
 * Имитирует успешный платеж без реальных запросов.
 */
export class MockPaymentService extends PaymentService {
	async initPayment(request: PaymentRequest): Promise<PaymentResponse> {
		console.log('MockPaymentService: initPayment', request)
		// Генерируем fake paymentId
		const paymentId = `mock_${Date.now()}_${Math.random().toString(36).substring(2)}`
		// Имитируем ссылку на платежный шлюз, который сразу редиректит на success
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
		const paymentUrl = `${baseUrl}/payment/success?transaction=${paymentId}&mock=true`
		return {
			paymentId,
			status: PaymentStatus.PENDING,
			paymentUrl,
			message: 'Перейдите по ссылке для завершения оплаты (тестовый режим)'
		}
	}

	async checkPayment(paymentId: string): Promise<PaymentStatus> {
		console.log('MockPaymentService: checkPayment', paymentId)
		// Симулируем успешный платеж через 2 секунды
		const isSuccess = paymentId.includes('mock') && Math.random() > 0.3
		return isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
	}

	async handleWebhook(data: any): Promise<{ status: PaymentStatus; paymentId: string }> {
		console.log('MockPaymentService: handleWebhook', data)
		// В тестовом режиме просто возвращаем успех
		return {
			status: PaymentStatus.SUCCESS,
			paymentId: data.paymentId || 'unknown'
		}
	}
}

/**
 * Фабрика для получения экземпляра платежного сервиса.
 * В зависимости от конфигурации окружения возвращает mock или реальный сервис.
 */
export async function getPaymentService(): Promise<PaymentService> {
	const useMock = process.env.NEXT_PUBLIC_USE_MOCK_PAYMENT === 'true' || process.env.NODE_ENV === 'development'
	if (useMock && !process.env.PLATEGA_MERCHANT_ID) {
		return new MockPaymentService()
	}
	// Используем Platega как основной провайдер
	const { PlategaPaymentService } = await import('./providers/platega.service')
	return new PlategaPaymentService()
}
