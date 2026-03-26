import { getPaymentService } from '@/services/payment/payment.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		// В реальном провайдере здесь должна быть проверка подписи/авторизации
		const body = await request.json()
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
