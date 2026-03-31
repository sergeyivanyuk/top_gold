import { recordVisit } from '@/lib/dailyStats'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Регистрирует посещение пользователя по IP.
 * Вызывается при загрузке главной страницы.
 */
export async function GET(request: NextRequest) {
	try {
		// Получаем IP адрес из заголовков (на Vercel это x-forwarded-for)
		const forwardedFor = request.headers.get('x-forwarded-for')
		const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'

		// Регистрируем посещение
		recordVisit(ip)

		return NextResponse.json({ success: true, ip })
	} catch (error) {
		console.error('Ошибка регистрации посещения:', error)
		return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
	}
}
