import constants from '@/data/constants.json'
import type { RouletteSegment } from '@/types/roulette'
// Цвета сегментов с градиентами (адаптировано под wheel.png) - яркие цвета на краю, темные ближе к центру
export const COLORS = {
	gold: 'linear-gradient(0deg, #FF9800 10%, #FFB74D 45%, #FFD54F 62%, #FFEB3B 91%)',
	black: 'linear-gradient(0deg, #3E2723 10%, #5D4037 45%, #8D6E63 67%, #BCAAA4 91%)',
	blue: 'linear-gradient(0deg, #0D47A1 10%, #1976D2 45%, #42A5F5 67%, #90CAF9 91%)',
	red: 'linear-gradient(0deg, #B71C1C 10%, #E53935 45%, #FF7043 67%, #FFAB91 91%)'
}

// Border для всех сегментов
export const SEGMENT_BORDER = '2px rgba(255, 233.54, 111.93, 0.90) solid'

// Сегменты рулетки (10 сегментов) - динамически на основе constants.json
export const ROULETTE_SEGMENTS: RouletteSegment[] = (() => {
	// Маппинг ID сегментов к цветам (вероятности берутся из constants.json)
	const segmentDefinitions = [
		{ id: 'red1', color: 'red' },
		{ id: 'blue1', color: 'blue' },
		{ id: 'black1', color: 'black' },
		{ id: 'red2', color: 'red' },
		{ id: 'blue2', color: 'blue' },
		{ id: 'black2', color: 'black' },
		{ id: 'red3', color: 'red' },
		{ id: 'blue3', color: 'blue' },
		{ id: 'black3', color: 'black' },
		{ id: 'gold', color: 'gold' }
	] as const

	return segmentDefinitions.map(def => {
		const segmentData = constants.segments[def.id as keyof typeof constants.segments]
		const gold = segmentData?.gold ?? 0
		const probability = segmentData?.probability ?? 1 // fallback
		return {
			id: def.id,
			label: gold.toString(),
			gold,
			color: def.color,
			gradient: COLORS[def.color as keyof typeof COLORS],
			probability
		}
	})
})()

// Градиент для разделительных линий
export const SEGMENT_BORDER_GRADIENT = 'from-yellow-400 via-yellow-600 to-yellow-400'

// Настройки рулетки
export const ROULETTE_CONFIG = {
	SPIN_DURATION: 10000, // время вращения в мс
	MIN_SPINS: 7, // минимум полных оборотов
	DECELERATION: 2.5 // коэффициент замедления
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
