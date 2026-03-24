import type { RouletteSegment } from '@/types/roulette'

// Цвета в hex для использования в conic-gradient
const COLORS = {
	gold: ['#ca8a04', '#a16207'], // yellow-600 to yellow-800
	black: ['#1f2937', '#0f172a'], // gray-800 to gray-950
	blue: ['#2563eb', '#1e40af'], // blue-600 to blue-800
	red: ['#dc2626', '#991b1b'] // red-600 to red-800
}

// Сегменты рулетки (10 сегментов)
// Перемешаны: черный → синий → красный → черный → синий → красный → черный → синий → красный → золотой
export const ROULETTE_SEGMENTS: RouletteSegment[] = [
	// Черный - 3000 (3 штуки)
	{ id: 'black1', label: '3000', gold: 3000, color: 'black', gradient: COLORS.black, probability: 10 },
	// Синий - 1000 (3 штуки)
	{ id: 'blue1', label: '1000', gold: 1000, color: 'blue', gradient: COLORS.blue, probability: 20 },
	// Красный - 5000 (3 штуки)
	{ id: 'red1', label: '5000', gold: 5000, color: 'red', gradient: COLORS.red, probability: 5 },

	// Черный
	{ id: 'black2', label: '3000', gold: 3000, color: 'black', gradient: COLORS.black, probability: 10 },
	// Синий
	{ id: 'blue2', label: '1000', gold: 1000, color: 'blue', gradient: COLORS.blue, probability: 20 },
	// Красный
	{ id: 'red2', label: '5000', gold: 5000, color: 'red', gradient: COLORS.red, probability: 5 },

	// Черный
	{ id: 'black3', label: '3000', gold: 3000, color: 'black', gradient: COLORS.black, probability: 10 },
	// Синий
	{ id: 'blue3', label: '1000', gold: 1000, color: 'blue', gradient: COLORS.blue, probability: 20 },
	// Красный
	{ id: 'red3', label: '5000', gold: 5000, color: 'red', gradient: COLORS.red, probability: 5 },

	// Золотой - 10000 (1 штука, самый редкий) - в конце
	{ id: 'gold', label: '10000', gold: 10000, color: 'gold', gradient: COLORS.gold, probability: 1 }
]

// Градиент для разделительных линий
export const SEGMENT_BORDER_GRADIENT = 'from-yellow-400 via-yellow-600 to-yellow-400'

// Настройки рулетки
export const ROULETTE_CONFIG = {
	SPIN_DURATION: 5000, // время вращения в мс
	MIN_SPINS: 5, // минимум полных оборотов
	DECELERATION: 0.98 // коэффициент замедления
} as const

// Функция для получения сегмента с учётом вероятностей (подкрутка)
export function getRandomSegment(overrideProbability?: string): RouletteSegment {
	// Если указана подкрутка - форсируем определённый сегмент
	if (overrideProbability) {
		const forcedSegment = ROULETTE_SEGMENTS.find(s => s.id === overrideProbability)
		if (forcedSegment) return forcedSegment
	}

	// Используем вероятности из сегментов
	const totalWeight = ROULETTE_SEGMENTS.reduce((sum, s) => sum + s.probability, 0)
	let random = Math.random() * totalWeight

	for (const segment of ROULETTE_SEGMENTS) {
		random -= segment.probability
		if (random <= 0) return segment
	}

	return ROULETTE_SEGMENTS[0]
}
