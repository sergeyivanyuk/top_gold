'use client'

import { Roulette } from '@/components/Roulette'
import { StatCard } from '@/components/ui/StatCard'
import { ROULETTE_NUMBER_GRADIENT, ROULETTE_SHADOW_GRADIENT } from '@/lib/constants'
import { useRouletteStore } from '@/lib/store/roulette'

export default function Home() {
	const { totalSpins, totalGoldWon, remainingSpins } = useRouletteStore()

	return (
		<main className=" flex flex-col">
			{/* Статистика */}
			{remainingSpins > 0 && (
				<div className="px-4 py-2 flex justify-center">
					<div className="flex items-center gap-5 px-5 py-1 bg-radial-gold rounded-card border-gold-light outline-offset-[-1px] mb-7.5">
						<span className="text-secondary-title">Вращений осталось:</span>
						<p className="text-center justify-center flex flex-col">
							<span className="relative inline-block h-[40px]">
								{/* Тень */}
								<span
									className="absolute top-0 left-0 translate-x-[2px] translate-y-[3px] font-extrabold text-[35px] uppercase"
									style={{
										backgroundImage: ROULETTE_SHADOW_GRADIENT,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										color: 'transparent',
										fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
										lineHeight: '35px',
										letterSpacing: '0.35px'
									}}
								>
									{remainingSpins}
								</span>
								{/* Основной текст */}
								<span
									className="relative font-extrabold text-[35px] uppercase underline"
									style={{
										backgroundImage: ROULETTE_NUMBER_GRADIENT,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										color: 'transparent',
										fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
										lineHeight: '35px',
										letterSpacing: '0.35px',
										textDecorationColor: 'inherit'
									}}
								>
									{remainingSpins}
								</span>
							</span>
						</p>
					</div>
				</div>
			)}

			{/* Рулетка */}
			<div className="flex-1 flex items-center justify-center">
				<Roulette />
			</div>
			{/* Дополнительная статистика */}
			<div className="py-2 px-1 grid grid-cols-2 gap-2.5 mt-10">
				<StatCard
					iconSrc="/users.svg"
					iconAlt="Игроки"
					label="Игроков сегодня"
					value="1482"
				/>
				<StatCard
					iconSrc="/golds.svg"
					iconAlt="Голда"
					label="Голды выдано"
					value="13 560 950"
					labelClassName="text-secondary-title"
				/>
			</div>
		</main>
	)
}
