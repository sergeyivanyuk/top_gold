import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RouletteSegment, Winner } from '@/types/roulette'

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
  
  // Действия
  setSpinning: (spinning: boolean) => void
  setCurrentSegment: (segment: RouletteSegment | null) => void
  addWinner: (winner: Winner) => void
  incrementSpins: () => void
  addGold: (amount: number) => void
  reset: () => void
}

export const useRouletteStore = create<RouletteStore>()(
  persist(
    (set) => ({
      isSpinning: false,
      currentSegment: null,
      lastWin: null,
      totalSpins: 0,
      totalGoldWon: 0,
      winners: [],

      setSpinning: (spinning) => set({ isSpinning: spinning }),
      
      setCurrentSegment: (segment) => set({ currentSegment: segment }),
      
      addWinner: (winner) => set((state) => ({
        winners: [winner, ...state.winners].slice(0, 100) // храним последних 100
      })),
      
      incrementSpins: () => set((state) => ({
        totalSpins: state.totalSpins + 1
      })),
      
      addGold: (amount) => set((state) => ({
        totalGoldWon: state.totalGoldWon + amount
      })),
      
      reset: () => set({
        isSpinning: false,
        currentSegment: null,
        lastWin: null,
        totalSpins: 0,
        totalGoldWon: 0,
        winners: []
      })
    }),
    {
      name: 'roulette-storage'
    }
  )
)
