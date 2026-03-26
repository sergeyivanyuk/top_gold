'use client'

import Image from 'next/image'

interface Win {
	username: string
	gold: string
}

interface RecentWinsProps {
	wins: Win[]
	currentIndex: number
	isResetting: boolean
	className?: string
}

export function RecentWins({ wins, currentIndex, isResetting, className = '' }: RecentWinsProps) {
	// Создаём расширенный массив для бесконечной анимации
	const extendedWins = [...wins, ...wins.slice(0, 3)]

	return (
		<div
			className={`flex flex-col items-center px-6 py-4 rounded-card mt-5 w-full bg-radial-gold border-gold-light outline-offset-[-1px] ${className}`}
		>
			<h2 className="text-center text-secondary-title mb-2.5">Последние выигрыши</h2>
			<div
				className="items w-full flex flex-col gap-3 h-[180px] overflow-hidden relative"
				aria-live="polite"
				aria-atomic="true"
			>
				<div
					className={isResetting ? '' : 'transition-transform duration-200'}
					style={{ transform: `translateY(-${currentIndex * 60}px)` }}
				>
					{extendedWins.map((win, index) => (
						<div key={index}>
							<div className="flex items-center justify-between w-full h-[60px]">
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
