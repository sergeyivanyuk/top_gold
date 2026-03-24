'use client'

import { Roulette } from '@/components/Roulette'
import { WinnersList } from '@/components/WinnersList'
import { useRouletteStore } from '@/lib/store/roulette'
import { Settings, TrendingUp } from 'lucide-react'

export default function Home() {
	const { totalSpins, totalGoldWon } = useRouletteStore()

	return (
		<main className="min-h-screen flex flex-col">
			{/* Header */}
			<header className="p-4 safe-area-top">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-gold">Gold Roulette</h1>
					<button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
						<Settings className="w-5 h-5 text-gray-400" />
					</button>
				</div>
			</header>

			{/* Статистика */}
			<div className="px-4 py-2 flex gap-4 overflow-x-auto">
				<div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
					<TrendingUp className="w-4 h-4 text-gold" />
					<span className="text-sm text-gray-400">Вращений:</span>
					<span className="font-bold">{totalSpins}</span>
				</div>
				<div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
					<span className="text-sm text-gray-400">Всего золота:</span>
					<span className="font-bold text-gold">{totalGoldWon.toLocaleString()}</span>
				</div>
			</div>

			{/* Рулетка */}
			<div className="flex-1 flex items-center justify-center py-4">
				<Roulette />
			</div>

			{/* Победители */}
			<div className="p-4 safe-area-bottom">
				<WinnersList />
			</div>
		</main>
	)
}
