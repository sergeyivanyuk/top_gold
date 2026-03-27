'use client'

import { Roulette } from '@/components/Roulette'
import { GradientNumber } from '@/components/ui/GradientNumber'
import { StatCard } from '@/components/ui/StatCard'
import constants from '@/data/constants.json'
import { useRouletteStore } from '@/lib/store/roulette'

export default function Home() {
	const { remainingSpins } = useRouletteStore()

	return (
		<main className=" flex flex-col">
			{/* Статистика */}
			<div className="px-4 py-2 flex justify-center">
				<div className="flex items-center gap-5 px-5 py-1 bg-radial-gold rounded-card border-gold-light outline-offset-[-1px] mb-7.5">
					<span className="text-secondary-title">Вращений осталось:</span>
					<GradientNumber
						value={remainingSpins}
						size="md"
					/>
				</div>
			</div>

			{/* Рулетка */}
			<div className="flex-1 flex items-center justify-center">
				<Roulette />
			</div>
			{/* Дополнительная статистика */}
			<div className="py-2 px-1 grid grid-cols-2 gap-2.5 mt-10">
				<StatCard
					iconSrc="/users.png"
					iconAlt="Игроки"
					label="Игроков сегодня"
					value={constants.stats.playersToday}
				/>
				<StatCard
					iconSrc="/golds.png"
					iconAlt="Голда"
					label="Голды выдано"
					value={constants.stats.goldIssued}
					labelClassName="text-secondary-title"
				/>
			</div>
		</main>
	)
}
