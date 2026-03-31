/**
 * Модуль для отслеживания дневной статистики (в памяти).
 * Сбрасывается каждый день после отправки вечернего отчёта.
 */

interface DailyStats {
	// Множество уникальных IP адресов посетителей сегодня
	uniqueVisitors: Set<string>
	// Множество уникальных nickname пользователей, совершивших покупку сегодня
	uniqueUsers: Set<string>
	// Количество покупок сегодня
	purchaseCount: number
	// Общая сумма покупок сегодня (в рублях)
	totalAmount: number
	// Дата последнего сброса (формат YYYY-MM-DD)
	lastResetDate: string
}

// Глобальный объект статистики (в памяти)
let dailyStats: DailyStats = {
	uniqueVisitors: new Set(),
	uniqueUsers: new Set(),
	purchaseCount: 0,
	totalAmount: 0,
	lastResetDate: getCurrentDate()
}

/**
 * Возвращает текущую дату в формате YYYY-MM-DD (по московскому времени)
 */
function getCurrentDate(): string {
	const now = new Date()
	// Приводим к московскому времени (UTC+3)
	const mskOffset = 3 * 60 * 60 * 1000
	const mskTime = new Date(now.getTime() + mskOffset)
	return mskTime.toISOString().split('T')[0]
}

/**
 * Проверяет, нужно ли сбросить статистику (если день сменился)
 */
function maybeResetStats() {
	const today = getCurrentDate()
	if (dailyStats.lastResetDate !== today) {
		dailyStats.uniqueVisitors.clear()
		dailyStats.uniqueUsers.clear()
		dailyStats.purchaseCount = 0
		dailyStats.totalAmount = 0
		dailyStats.lastResetDate = today
	}
}

/**
 * Регистрирует посещение по IP
 * @param ip IP адрес посетителя
 */
export function recordVisit(ip: string) {
	maybeResetStats()
	dailyStats.uniqueVisitors.add(ip)
}

/**
 * Регистрирует пользователя (уникальный nickname) в статистике
 * @param nickname Ник пользователя
 */
export function recordUser(nickname: string) {
	maybeResetStats()
	dailyStats.uniqueUsers.add(nickname)
}

/**
 * Регистрирует покупку
 * @param amount Сумма покупки в рублях
 */
export function recordPurchase(amount: number) {
	maybeResetStats()
	dailyStats.purchaseCount += 1
	dailyStats.totalAmount += amount
}

/**
 * Возвращает текущую статистику за день
 */
export function getDailyStats() {
	maybeResetStats()
	return {
		usersToday: dailyStats.uniqueVisitors.size, // по IP
		purchasesToday: dailyStats.purchaseCount,
		totalAmountToday: dailyStats.totalAmount
	}
}

/**
 * Сбрасывает статистику (вызывается после отправки вечернего отчёта)
 */
export function resetStats() {
	dailyStats.uniqueVisitors.clear()
	dailyStats.uniqueUsers.clear()
	dailyStats.purchaseCount = 0
	dailyStats.totalAmount = 0
	dailyStats.lastResetDate = getCurrentDate()
}
