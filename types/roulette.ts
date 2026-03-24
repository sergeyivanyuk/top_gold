// Типы для рулетки

export interface RouletteSegment {
	id: string
	label: string
	gold: number
	color: string // ключ цвета (gold, black, blue, red)
	gradient: string[] // [startColor, endColor]
	probability: number // 0-100, используется для подкрутки
}

export interface Winner {
	id: string
	username: string
	gold: number
	timestamp: number
	segment: string
}

export interface RouletteState {
	isSpinning: boolean
	currentSegment: RouletteSegment | null
	winners: Winner[]
	totalSpins: number
	totalGoldWon: number
}
