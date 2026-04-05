import { telegramService } from '@/services/telegram/telegram.service'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { username } = body

		// username не обязателен, но если передан, используем его
		const success = await telegramService.sendNewUserNotification(username)

		if (!success) {
			return NextResponse.json({ error: 'Не удалось отправить уведомление в Telegram' }, { status: 500 })
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Ошибка при отправке уведомления о новом пользователе:', error)
		return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
	}
}
