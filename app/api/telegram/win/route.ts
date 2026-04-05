import { telegramService } from '@/services/telegram/telegram.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { username, goldAmount, orderNumber } = body

		// Валидация обязательных полей
		if (!username || goldAmount === undefined) {
			return NextResponse.json({ error: 'Необходимые поля: username, goldAmount' }, { status: 400 })
		}

		const success = await telegramService.sendWinNotification(username, Number(goldAmount), orderNumber)

		if (!success) {
			return NextResponse.json({ error: 'Не удалось отправить уведомление в Telegram' }, { status: 500 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка при отправке уведомления о выигрыше:', error)
		return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
	}
}
