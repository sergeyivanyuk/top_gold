import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Purchase {
	id: string
	nickname: string
	tariff: string
	spins: number // общее количество вращений (основные + бонусные)
	timestamp: number
	transactionId?: string
}

interface PurchasesStore {
	purchases: Purchase[]
	addPurchase: (purchase: Omit<Purchase, 'id' | 'timestamp'>) => void
	getRemainingSpins: (nickname: string) => number
	consumeSpin: (nickname: string) => boolean
	getTotalSpins: (nickname: string) => number
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
					timestamp: Date.now()
				}
				set(state => ({
					purchases: [...state.purchases, newPurchase]
				}))
			},

			getRemainingSpins: nickname => {
				const purchases = get().purchases.filter(p => p.nickname === nickname)
				// Для простоты считаем, что все вращения еще не использованы
				// В реальности нужно отслеживать использованные вращения
				return purchases.reduce((total, p) => total + p.spins, 0)
			},

			consumeSpin: nickname => {
				// В упрощенной реализации просто уменьшаем общее количество вращений
				// Для точного учета нужно хранить отдельно использованные вращения
				const purchases = get().purchases.filter(p => p.nickname === nickname)
				if (purchases.length === 0) return false

				// Удаляем одно вращение из первого подходящего purchase
				// В реальном приложении нужна более сложная логика
				const updatedPurchases = [...get().purchases]
				const index = updatedPurchases.findIndex(p => p.nickname === nickname && p.spins > 0)
				if (index === -1) return false

				updatedPurchases[index].spins -= 1
				set({ purchases: updatedPurchases })
				return true
			},

			getTotalSpins: nickname => {
				return get()
					.purchases.filter(p => p.nickname === nickname)
					.reduce((total, p) => total + p.spins, 0)
			},

			clearPurchases: () => {
				set({ purchases: [] })
			}
		}),
		{
			name: 'purchases-storage',
			version: 1
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
