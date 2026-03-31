import { telegramService } from '@/services/telegram/telegram.service'
import { getDailyStats, resetStats } from '@/lib/dailyStats'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET или POST эндпоинт для отправки вечерней статистики.
 * Можно вызывать вручную или по расписанию (cron job).
 * По умолчанию использует динамические данные из dailyStats.
 * Параметры запроса позволяют переопределить данные.
 */
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const resetAfter = searchParams.get('reset') !== 'false' // по умолчанию true

		// Получаем динамическую статистику
		const { usersToday, purchasesToday, totalAmountToday } = getDailyStats()

		// Переопределяем параметрами запроса, если переданы
		const usersOverride = searchParams.get('users')
		const purchasesOverride = searchParams.get('purchases')
		const amountOverride = searchParams.get('amount')

		const finalUsers = usersOverride ? parseInt(usersOverride) : usersToday
		const finalPurchases = purchasesOverride ? parseInt(purchasesOverride) : purchasesToday
		const finalAmount = amountOverride ? parseInt(amountOverride) : totalAmountToday

		const success = await telegramService.sendEveningStatistics(finalUsers, finalPurchases, finalAmount)

		if (!success) {
			return NextResponse.json({ error: 'Не удалось отправить статистику в Telegram' }, { status: 500 })
		}

		// Сбрасываем статистику после отправки, если не указано иное
		if (resetAfter) {
			resetStats()
		}

		return NextResponse.json({
			message: 'Вечерняя статистика отправлена',
			data: {
				usersToday: finalUsers,
				purchasesToday: finalPurchases,
				totalAmountToday: finalAmount
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
		const resetAfter = body.reset !== false // по умолчанию true

		// Получаем динамическую статистику
		const { usersToday, purchasesToday, totalAmountToday } = getDailyStats()

		// Переопределяем данными из тела, если переданы
		const finalUsers = body.usersToday !== undefined ? parseInt(body.usersToday) : usersToday
		const finalPurchases = body.purchasesToday !== undefined ? parseInt(body.purchasesToday) : purchasesToday
		const finalAmount = body.totalAmountToday !== undefined ? parseInt(body.totalAmountToday) : totalAmountToday

		const success = await telegramService.sendEveningStatistics(finalUsers, finalPurchases, finalAmount)

		if (!success) {
			return NextResponse.json({ error: 'Не удалось отправить статистику в Telegram' }, { status: 500 })
		}

		// Сбрасываем статистику после отправки, если не указано иное
		if (resetAfter) {
			resetStats()
		}

		return NextResponse.json({
			message: 'Вечерняя статистика отправлена',
			data: {
				usersToday: finalUsers,
				purchasesToday: finalPurchases,
				totalAmountToday: finalAmount
			}
		})
	} catch (error) {
		console.error('Ошибка отправки вечерней статистики:', error)
		return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
	}
}
