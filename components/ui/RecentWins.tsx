'use client'

import Image from 'next/image'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'

interface Win {
	username: string
	gold: string
}

interface RecentWinsProps {
	wins: Win[]
	intervalMs?: number
	className?: string
}

export function RecentWins({ wins, intervalMs = 3000, className = '' }: RecentWinsProps) {
	const itemsPerView = 3
	const { currentIndex, isResetting } = useInfiniteScroll({
		itemCount: wins.length,
		itemsPerView,
		intervalMs,
		autoPlay: true
	})

	// Создаём расширенный массив для бесконечной анимации
	const extendedWins = [...wins, ...wins.slice(0, itemsPerView)]

	// Высота одного элемента (включая gap)
	const itemHeight = 40 // 40px высота элемента

	return (
		<div
			className={`flex flex-col items-center px-6 py-4 rounded-card mt-5 w-full bg-radial-gold border-gold-light outline-offset-[-1px] ${className}`}
		>
			<h2 className="text-center text-secondary-title mb-2.5">Последние выигрыши</h2>
			<div
				className="items w-full flex flex-col gap-2 h-[120px] overflow-hidden relative"
				aria-live="polite"
				aria-atomic="true"
			>
				<div
					className={isResetting ? '' : 'transition-transform duration-300 ease-in-out'}
					style={{ transform: `translateY(-${currentIndex * itemHeight}px)` }}
				>
					{extendedWins.map((win, index) => (
						<div key={index}>
							<div className="flex items-center justify-between w-full h-[40px]">
								<span className="text-center text-base font-medium text-white">{win.username}</span>
								<div className="flex items-center">
									<span className="text-stat-value">{win.gold}</span>
									<Image
										src="/golds.png"
										alt=""
										role="presentation"
										width={20}
										height={20}
									/>
								</div>
							</div>
							{index < extendedWins.length - 1 && (
								<div className="self-stretch h-0 opacity-50 outline-1 outline-offset-[-0.50px] outline-orange-300" />
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
