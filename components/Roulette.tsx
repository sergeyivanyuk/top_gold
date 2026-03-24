'use client'

import { Button } from '@/components/ui/Button'
import { getRandomSegment, ROULETTE_CONFIG, ROULETTE_SEGMENTS } from '@/config/roulette'
import { useRouletteStore } from '@/lib/store/roulette'
import { cn } from '@/lib/utils'
import { RotateCcw, Trophy } from 'lucide-react'
import { useRef, useState } from 'react'

interface RouletteProps {
	onWin?: (gold: number, segment: string) => void
}

export function Roulette({ onWin }: RouletteProps) {
	const wheelRef = useRef<HTMLDivElement>(null)
	const [rotation, setRotation] = useState(0)
	const [isSpinning, setIsSpinning] = useState(false)
	const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
	const [showWinModal, setShowWinModal] = useState(false)
	const [winAmount, setWinAmount] = useState(0)

	const { addWinner, incrementSpins, addGold } = useRouletteStore()

	// Подкрутка (для админа)
	const [overrideSegment, setOverrideSegment] = useState<string | null>(null)

	const segmentAngle = 360 / ROULETTE_SEGMENTS.length

	const spinWheel = () => {
		if (isSpinning) return

		setIsSpinning(true)
		setSelectedSegment(null)

		// Определяем выигрышный сегмент
		const winningSegment = getRandomSegment(overrideSegment || undefined)

		// Вычисляем угол для этого сегмента
		const segmentIndex = ROULETTE_SEGMENTS.findIndex(s => s.id === winningSegment.id)

		// Центр сегмента находится в: segmentIndex * segmentAngle + segmentAngle / 2
		// Чтобы этот сегмент оказался под стрелкой (вверху, 0 градусов),
		// нужно повернуть колесо так, чтобы сегмент оказался в позиции 0
		// Сегмент i находится от i*angle до (i+1)*angle
		// Центр сегмента: i*angle + angle/2
		// Чтобы центр сегмента оказался вверху: rotation + (360 - (i*angle + angle/2))
		const segmentCenterAngle = segmentIndex * segmentAngle + segmentAngle / 2

		// Добавляем несколько полных оборотов + небольшое случайное смещение внутри сегмента
		const spins = ROULETTE_CONFIG.MIN_SPINS + Math.floor(Math.random() * 3)
		const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.6 // ±30% от сегмента
		const totalRotation = rotation + spins * 360 + (360 - segmentCenterAngle) + randomOffset

		// Анимация
		const duration = ROULETTE_CONFIG.SPIN_DURATION
		const startTime = Date.now()
		const startRotation = rotation

		const animate = () => {
			const elapsed = Date.now() - startTime
			const progress = Math.min(elapsed / duration, 1)

			// Easing function (замедление в конце)
			const easeOut = 1 - Math.pow(1 - progress, 3)
			const currentRotation = startRotation + (totalRotation - startRotation) * easeOut

			setRotation(currentRotation)

			if (progress < 1) {
				requestAnimationFrame(animate)
			} else {
				// Конец вращения - вычисляем какой сегмент под стрелкой
				const finalRotation = currentRotation % 360
				// Стрелка вверху (0 градусов), колесо повернуто на finalRotation
				// Сегмент под стрелкой: (360 - finalRotation) % 360
				const pointerAngle = (360 - finalRotation) % 360
				const winningIndex = Math.floor(pointerAngle / segmentAngle)
				const actualWinningSegment = ROULETTE_SEGMENTS[winningIndex]

				setIsSpinning(false)
				setSelectedSegment(actualWinningSegment.id)
				setWinAmount(actualWinningSegment.gold)
				setShowWinModal(true)

				// Обновляем статистику
				incrementSpins()
				addGold(actualWinningSegment.gold)

				// Добавляем победителя
				const winner = {
					id: Date.now().toString(),
					username: `Player${Math.floor(Math.random() * 9000) + 1000}`,
					gold: actualWinningSegment.gold,
					timestamp: Date.now(),
					segment: actualWinningSegment.label
				}
				addWinner(winner)

				onWin?.(actualWinningSegment.gold, actualWinningSegment.label)

				// Сбрасываем подкрутку после использования
				setOverrideSegment(null)
			}
		}

		requestAnimationFrame(animate)
	}

	return (
		<div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4">
			{/* Колесо рулетки */}
			<div className="relative">
				{/* Указатель */}
				<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
					<div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-gold drop-shadow-lg" />
				</div>

				{/* Колесо */}
				<div
					ref={wheelRef}
					className="relative w-72 h-72 md:w-80 md:h-80 rounded-full shadow-2xl border-4 border-gold/30 overflow-hidden"
					style={{ transform: `rotate(${rotation}deg)` }}
				>
					{/* Сегменты через conic-gradient */}
					<div
						className="absolute inset-0"
						style={{
							background: `conic-gradient(${ROULETTE_SEGMENTS.map(
								(s, i) => `${s.gradient[0]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
							).join(', ')})`
						}}
					/>

					{/* Текст на сегментах */}
					{ROULETTE_SEGMENTS.map((segment, index) => (
						<div
							key={segment.id}
							className="absolute inset-0 flex items-center justify-center"
							style={{
								transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)`
							}}
						>
							<span
								className="font-bold text-lg drop-shadow-md"
								style={{
									transform: 'translateY(-110px)',
									background: 'linear-gradient(to bottom, #ffe680, #cc7a08)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text'
								}}
							>
								{segment.label}
							</span>
						</div>
					))}

					{/* Разделительные линии */}
					{ROULETTE_SEGMENTS.map((_, index) => (
						<div
							key={`line-${index}`}
							className="absolute inset-0 pointer-events-none"
							style={{
								transform: `rotate(${index * segmentAngle}deg)`
							}}
						>
							<div className="absolute left-1/2 top-0 w-[2px] h-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-400 via-yellow-600 to-yellow-400" />
						</div>
					))}

					{/* Центральный круг */}
					<div className="absolute inset-0 m-auto w-20 h-20 bg-gray-900 rounded-full" />
				</div>

				{/* Центр колеса */}
				<div className="absolute inset-0 m-auto w-16 h-16 bg-gray-900 rounded-full border-4 border-gold flex items-center justify-center shadow-lg z-10">
					<Trophy className="w-8 h-8 text-gold" />
				</div>
			</div>

			{/* Кнопка вращения */}
			<Button
				onClick={spinWheel}
				disabled={isSpinning}
				size="lg"
				className={cn('w-full', isSpinning && 'opacity-50 cursor-not-allowed')}
			>
				{isSpinning ? (
					<span className="flex items-center gap-2">
						<RotateCcw className="w-5 h-5 animate-spin" />
						Вращаю...
					</span>
				) : (
					'Крутить рулетку'
				)}
			</Button>

			{/* Панель подкрутки (для тестирования) */}
			{process.env.NODE_ENV === 'development' && (
				<div className="w-full p-4 bg-gray-800/50 rounded-lg">
					<p className="text-xs text-gray-400 mb-2">Подкрутка (dev only):</p>
					<div className="flex flex-wrap gap-2">
						{ROULETTE_SEGMENTS.map(segment => (
							<button
								key={segment.id}
								onClick={() => setOverrideSegment(overrideSegment === segment.id ? null : segment.id)}
								className={cn('px-2 py-1 text-xs rounded', overrideSegment === segment.id ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300')}
								disabled={isSpinning}
							>
								{segment.label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Модальное окно выигрыша */}
			{showWinModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-xs"
						onClick={() => setShowWinModal(false)}
					/>
					<div className="relative bg-gray-900 rounded-2xl p-4 text-center border-2 border-gold  max-w-sm w-full">
						<h2 className="text-2xl font-bold text-gold mb-2 uppercase">Вы выиграли!</h2>
						<p className="text-white mb-4">Выйгрыш будет начислен на ваш аккаунт в течении 24 часов!</p>
						<div className="w-full h-[0.3px] bg-[#8f7651] mb-4"></div>
						<div className="text-5xl font-bold text-gold">{winAmount} 🪙</div>
						<div className="w-full uppercase text-white font-semibold flex items-center justify-center mb-5">ГОЛДЫ</div>
						<Button
							onClick={() => setShowWinModal(false)}
							className="w-full"
						>
							Забрать и продолжить
						</Button>
					</div>
				</div>
			)}
		</div>
	)
}
