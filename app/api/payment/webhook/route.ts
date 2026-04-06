import { getPaymentService } from '@/services/payment/payment.service'
import { telegramService } from '@/services/telegram/telegram.service'
import { PaymentStatus } from '@/types/payment'
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

		// Логируем успешный платеж
		if (result.status === PaymentStatus.SUCCESS) {
			console.log(`✅ Успешный платеж ${result.paymentId}`)
			// Здесь можно было бы добавить покупку в БД, но у нас только клиентское хранилище
			// В реальном приложении нужно сохранять в базу данных

			// Отправляем уведомление в Telegram
			try {
				// Извлекаем сумму платежа из тела вебхука
				// Предполагаемая структура: body.paymentDetails.amount или body.amount
				const amount = body.paymentDetails?.amount || body.amount || 0
				const orderNumber = result.paymentId
				const paymentTime = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })

				console.log(`Отправка уведомления о платеже: ${amount} ₽, заказ ${orderNumber}`)
				await telegramService.sendPurchaseNotification(amount, orderNumber, paymentTime)
			} catch (telegramError) {
				console.error('Ошибка отправки уведомления в Telegram:', telegramError)
				// Не прерываем выполнение, просто логируем ошибку
			}
		}

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
