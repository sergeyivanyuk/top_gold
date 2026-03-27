import constants from '@/data/constants.json'
import type { RouletteSegment } from '@/types/roulette'
// Цвета сегментов с градиентами (точные значения)
const COLORS = {
	gold: 'linear-gradient(0deg,  #FFB81F 9%, #A25A1E 38%, #935C14 55%, #5D3E15 90%)',
	black: 'linear-gradient(0deg, #493C2C 9%, #5E411D 33%, #401F0B 55%, #140501 90%)',
	blue: 'linear-gradient(0deg, #124472 9%, #1E3469 33%, #2B1C61 55%, #1D003E 90%)',
	red: 'linear-gradient(0deg, #C35B15 9%, #D34415 33%, #C42A03 55%, #830000 90%)'
}

// Border для всех сегментов
export const SEGMENT_BORDER = '2px rgba(255, 233.54, 111.93, 0.90) solid'

// Сегменты рулетки (10 сегментов) - динамически на основе constants.json
export const ROULETTE_SEGMENTS: RouletteSegment[] = (() => {
	// Маппинг ID сегментов к цветам (вероятности берутся из constants.json)
	const segmentDefinitions = [
		{ id: 'black1', color: 'black' },
		{ id: 'blue1', color: 'blue' },
		{ id: 'red1', color: 'red' },
		{ id: 'black2', color: 'black' },
		{ id: 'blue2', color: 'blue' },
		{ id: 'red2', color: 'red' },
		{ id: 'black3', color: 'black' },
		{ id: 'blue3', color: 'blue' },
		{ id: 'red3', color: 'red' },
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
