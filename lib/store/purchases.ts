import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Purchase {
	id: string
	nickname: string
	tariff: string
	spins: number // общее количество вращений (основные + бонусные)
	usedSpins: number // количество уже использованных вращений
	timestamp: number
	transactionId?: string
}

interface PurchasesStore {
	purchases: Purchase[]
	addPurchase: (purchase: Omit<Purchase, 'id' | 'timestamp' | 'usedSpins'>) => void
	getRemainingSpins: (nickname: string) => number
	consumeSpin: (nickname: string) => boolean
	getTotalSpins: (nickname: string) => number
	getUsedSpins: (nickname: string) => number
	clearPurchases: () => void
}

export const usePurchasesStore = create<PurchasesStore>()(
	persist(
		(set, get) => ({
			purchases: [],

			addPurchase: purchaseData => {
				const newPurchase: Purchase = {
					...purchaseData,
					id: Date.now().toString(),
					usedSpins: 0,
					timestamp: Date.now()
				}
				set(state => ({
					purchases: [...state.purchases, newPurchase]
				}))
			},

			getRemainingSpins: nickname => {
				const purchases = get().purchases.filter(p => p.nickname === nickname)
				return purchases.reduce((total, p) => total + (p.spins - p.usedSpins), 0)
			},

			consumeSpin: nickname => {
				const purchases = get().purchases.filter(p => p.nickname === nickname)
				if (purchases.length === 0) return false

				// Находим первую покупку, где есть неиспользованные вращения
				const updatedPurchases = [...get().purchases]
				const index = updatedPurchases.findIndex(p => p.nickname === nickname && p.usedSpins < p.spins)
				if (index === -1) return false

				// Увеличиваем счетчик использованных вращений
				updatedPurchases[index].usedSpins += 1

				set({ purchases: updatedPurchases })
				return true
			},

			getTotalSpins: nickname => {
				return get()
					.purchases.filter(p => p.nickname === nickname)
					.reduce((total, p) => total + p.spins, 0)
			},

			getUsedSpins: nickname => {
				return get()
					.purchases.filter(p => p.nickname === nickname)
					.reduce((total, p) => total + p.usedSpins, 0)
			},

			clearPurchases: () => {
				set({ purchases: [] })
			}
		}),
		{
			name: 'purchases-storage',
			version: 2 // Увеличиваем версию для миграции
		}
	)
)

// Вспомогательная функция для получения количества вращений по тарифу
export const getSpinsByTariff = (tariff: string): number => {
	const tariffMap: Record<string, number> = {
		Стандарт: 1, // 1 основное + 0 бонусных
		Выгодный: 4, // 3 основных + 1 бонусное
		Премиум: 7, // 5 основных + 2 бонусных
		Люкс: 11 // 8 основных + 3 бонусных (исправлено с 13 на 11)
	}
	return tariffMap[tariff] || 0
}
