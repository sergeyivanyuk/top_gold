import type { RouletteSegment, Winner } from '@/types/roulette'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RouletteStore {
	// Состояние
	isSpinning: boolean
	currentSegment: RouletteSegment | null
	lastWin: Winner | null

	// Статистика
	totalSpins: number
	totalGoldWon: number

	// Победители
	winners: Winner[]

	// Оставшиеся вращения
	remainingSpins: number

	// Накопленное золото за текущий тариф
	tariffGold: number

	// Действия
	setSpinning: (spinning: boolean) => void
	setCurrentSegment: (segment: RouletteSegment | null) => void
	addWinner: (winner: Winner) => void
	incrementSpins: () => void
	addGold: (amount: number) => void
	addTariffGold: (amount: number) => void
	resetTariffGold: () => void
	setRemainingSpins: (count: number) => void
	decrementRemainingSpins: () => void
	reset: () => void
}

export const useRouletteStore = create<RouletteStore>()(
	persist(
		set => ({
			isSpinning: false,
			currentSegment: null,
			lastWin: null,
			totalSpins: 0,
			totalGoldWon: 0,
			winners: [],
			remainingSpins: 1,
			tariffGold: 0,

			setSpinning: spinning => set({ isSpinning: spinning }),

			setCurrentSegment: segment => set({ currentSegment: segment }),

			addWinner: winner =>
				set(state => ({
					winners: [winner, ...state.winners].slice(0, 100) // храним последних 100
				})),

			incrementSpins: () =>
				set(state => ({
					totalSpins: state.totalSpins + 1
				})),

			addGold: amount =>
				set(state => ({
					totalGoldWon: state.totalGoldWon + amount
				})),

			addTariffGold: amount =>
				set(state => ({
					tariffGold: state.tariffGold + amount
				})),

			resetTariffGold: () => set({ tariffGold: 0 }),

			setRemainingSpins: count => set({ remainingSpins: count }),

			decrementRemainingSpins: () =>
				set(state => ({
					remainingSpins: Math.max(0, state.remainingSpins - 1)
				})),

			reset: () =>
				set({
					isSpinning: false,
					currentSegment: null,
					lastWin: null,
					totalSpins: 0,
					totalGoldWon: 0,
					winners: [],
					remainingSpins: 1,
					tariffGold: 0
				})
		}),
		{
			name: 'roulette-storage'
		}
	)
)
