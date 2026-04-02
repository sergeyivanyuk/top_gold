import { getPaymentService } from '@/services/payment/payment.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		// Проверка аутентификации через заголовки Platega
		const merchantId = request.headers.get('X-MerchantId')
		const secret = request.headers.get('X-Secret')

		const expectedMerchantId = process.env.PLATEGA_MERCHANT_ID
		const expectedSecret = process.env.PLATEGA_API_KEY

		// Если в окружении есть учетные данные Platega, проверяем их
		if (expectedMerchantId && expectedSecret) {
			if (merchantId !== expectedMerchantId || secret !== expectedSecret) {
				console.warn('Неавторизованный вебхук: неверные учетные данные')
				return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
			}
		} else {
			console.warn('Вебхук принят без проверки: учетные данные Platega не настроены')
		}

		const body = await request.json()
		const paymentService = await getPaymentService()
		const result = await paymentService.handleWebhook(body)

		// Обновляем статус платежа в БД, начисляем вращения и т.д.
		// TODO: реализовать логику обновления состояния платежа и начисления наград

		return NextResponse.json({ success: true, ...result }, { status: 200 })
	} catch (error) {
		console.error('Ошибка обработки вебхука:', error)
		return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
	}
}

// Некоторые платежные системы отправляют GET для проверки эндпоинта
export async function GET() {
	return NextResponse.json({ message: 'Webhook endpoint is active' }, { status: 200 })
}
