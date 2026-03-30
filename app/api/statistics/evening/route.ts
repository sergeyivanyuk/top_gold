import { telegramService } from '@/services/telegram/telegram.service'
import { NextRequest, NextResponse } from 'next/server'
import constants from '@/data/constants.json'

/**
 * GET или POST эндпоинт для отправки вечерней статистики.
 * Можно вызывать вручную или по расписанию (cron job).
 * Поддерживает параметры запроса для переопределения данных.
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const usersToday = parseInt(searchParams.get('users') || constants.stats.playersToday.replace(/\s/g, '')) || 0
		const purchasesToday = parseInt(searchParams.get('purchases') || '8')
		const totalAmountToday = parseInt(searchParams.get('amount') || '1000')

		const success = await telegramService.sendEveningStatistics(usersToday, purchasesToday, totalAmountToday)

		if (!success) {
			return NextResponse.json({ error: 'Не удалось отправить статистику в Telegram' }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Вечерняя статистика отправлена',
			data: {
				usersToday,
				purchasesToday,
				totalAmountToday
			}
		})
	} catch (error) {
		console.error('Ошибка отправки вечерней статистики:', error)
		return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
	}
}

// POST для тех же целей, но с возможностью передать данные в теле
export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}))
		const usersToday = body.usersToday || parseInt(constants.stats.playersToday.replace(/\s/g, '')) || 0
		const purchasesToday = body.purchasesToday || 8
		const totalAmountToday = body.totalAmountToday || 1000

		const success = await telegramService.sendEveningStatistics(usersToday, purchasesToday, totalAmountToday)

		if (!success) {
			return NextResponse.json({ error: 'Не удалось отправить статистику в Telegram' }, { status: 500 })
		}

		return NextResponse.json({
			message: 'Вечерняя статистика отправлена',
			data: {
				usersToday,
				purchasesToday,
				totalAmountToday
			}
		})
	} catch (error) {
		console.error('Ошибка отправки вечерней статистики:', error)
		return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
	}
}
