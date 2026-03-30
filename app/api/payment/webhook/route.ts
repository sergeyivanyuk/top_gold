import { getPaymentService } from '@/services/payment/payment.service'
import { NextRequest, NextResponse } from 'next/server'

const PLATEGA_MERCHANT_ID = process.env.PLATEGA_MERCHANT_ID || ''
const PLATEGA_API_KEY = process.env.PLATEGA_API_KEY || ''

export async function POST(request: NextRequest) {
	try {
		// Проверка аутентификации через заголовки (как требует Platega)
		const merchantId = request.headers.get('X-MerchantId')
		const secret = request.headers.get('X-Secret')

		if (!merchantId || !secret) {
			return NextResponse.json({ error: 'Missing authentication headers' }, { status: 401 })
		}

		if (merchantId !== PLATEGA_MERCHANT_ID || secret !== PLATEGA_API_KEY) {
			return NextResponse.json({ error: 'Invalid credentials' }, { status: 403 })
		}

		const body = await request.json()

		// Базовая валидация структуры
		if (!body.id || !body.status) {
			return NextResponse.json({ error: 'Invalid webhook payload: missing id or status' }, { status: 400 })
		}

		const paymentService = await getPaymentService()
		const result = await paymentService.handleWebhook(body)

		// Обновляем статус платежа в БД, начисляем вращения и т.д.
		// TODO: реализовать логику обновления состояния платежа и начисления наград

		console.log('Webhook processed:', result)

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
