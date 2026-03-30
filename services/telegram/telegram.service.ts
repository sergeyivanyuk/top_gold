/**
 * Сервис для отправки уведомлений в Telegram через Bot API.
 */

interface TelegramMessage {
	chatId?: string
	text: string
	parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}

export class TelegramService {
	private readonly botToken: string
	private readonly defaultChatId: string
	private readonly apiUrl: string

	constructor() {
		// Используем публичные переменные, доступные на клиенте, с fallback на серверные
		this.botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || ''
		this.defaultChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID || ''
		this.apiUrl = `https://api.telegram.org/bot${this.botToken}`

		if (!this.botToken) {
			console.warn('TELEGRAM_BOT_TOKEN не установлен. Уведомления отправляться не будут.')
		}
		if (!this.defaultChatId) {
			console.warn('TELEGRAM_CHAT_ID не установлен. Уведомления отправляться не будут.')
		}
	}

	/**
	 * Отправляет текстовое сообщение в Telegram.
	 * @param message Объект сообщения
	 * @returns Promise с результатом отправки
	 */
	async sendMessage(message: TelegramMessage): Promise<boolean> {
		const chatId = message.chatId || this.defaultChatId
		if (!this.botToken || !chatId) {
			console.error('Не удалось отправить сообщение: отсутствует токен или chat ID.')
			return false
		}

		const url = `${this.apiUrl}/sendMessage`
		const payload = {
			chat_id: chatId,
			text: message.text,
			parse_mode: message.parseMode || undefined,
			disable_web_page_preview: true
		}

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})

			if (!response.ok) {
				const errorText = await response.text()
				console.error(`Ошибка отправки Telegram сообщения: ${response.status} ${errorText}`)
				return false
			}

			console.log('Telegram уведомление успешно отправлено.')
			return true
		} catch (error) {
			console.error('Ошибка при отправке Telegram уведомления:', error)
			return false
		}
	}

	/**
	 * Отправляет уведомление о покупке тарифа.
	 * @param amount Сумма оплаты
	 * @param orderNumber Номер заказа
	 * @param paymentTime Время оплаты (строка)
	 * @param chatId Опциональный chat ID (иначе используется дефолтный)
	 */
	async sendPurchaseNotification(amount: number, orderNumber: string, paymentTime: string, chatId?: string): Promise<boolean> {
		const text = `ПОКУПКА!\n\nСумма: ${amount} ₽\nНомер заказа: ${orderNumber}\nВремя оплаты: ${paymentTime} МСК`
		return this.sendMessage({ chatId, text })
	}

	/**
	 * Отправляет уведомление о выигрыше голды.
	 * @param username Ник игрока
	 * @param goldAmount Сумма выигранной голды
	 * @param orderNumber Номер заказа (опционально)
	 * @param chatId Опциональный chat ID
	 */
	async sendWinNotification(username: string, goldAmount: number, orderNumber?: string, chatId?: string): Promise<boolean> {
		let text = `ВЫЙГРЫШ!\n\nНик: ${username}\nГолды выпало: ${goldAmount}`
		if (orderNumber) {
			text += `\nНомер заказа: ${orderNumber}`
		}
		return this.sendMessage({ chatId, text })
	}

	/**
	 * Отправляет вечернюю статистику за день.
	 * @param usersToday Количество уникальных пользователей за день
	 * @param purchasesToday Количество покупок тарифов за день
	 * @param totalAmountToday Общая сумма выручки за день (в рублях)
	 * @param chatId Опциональный chat ID
	 */
	async sendEveningStatistics(usersToday: number, purchasesToday: number, totalAmountToday: number, chatId?: string): Promise<boolean> {
		const text = `----ВЕЧЕРНЯЯ СТАТИСТИКА----\n\nПользователей сегодня: ${usersToday}\nПокупок сегодня: ${purchasesToday}\nСумма за сегодня: ${totalAmountToday} ₽`
		return this.sendMessage({ chatId, text })
	}
}

// Экспортируем синглтон для удобства
export const telegramService = new TelegramService()
