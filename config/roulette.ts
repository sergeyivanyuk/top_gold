import type { RouletteSegment } from '@/types/roulette'

// Цвета сегментов с градиентами
const COLORS = {
	gold: 'linear-gradient(180deg, #FFB81F 9%, #A25A1E 38%, #935C14 55%, #5D3E15 90%)',
	black: 'linear-gradient(180deg, #493C2C 9%, #5E411D 33%, #401F0B 55%, #140501 90%)',
	blue: 'linear-gradient(180deg, #124472 9%, #1E3469 33%, #2B1C61 55%, #1D003E 90%)',
	red: 'linear-gradient(180deg, #C35B15 9%, #D34415 33%, #C42A03 55%, #830000 90%)'
}

// Border для всех сегментов
export const SEGMENT_BORDER = '2px rgba(255, 233.54, 111.93, 0.90) solid'

// Сегменты рулетки (10 сегментов)
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
