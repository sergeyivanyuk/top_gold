'use client'

import { Button } from '@/components/ui/Button'
import { getRandomSegment, ROULETTE_CONFIG, ROULETTE_SEGMENTS } from '@/config/roulette'
import { useRouletteStore } from '@/lib/store/roulette'
import { cn } from '@/lib/utils'
import { RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'
import { ExtraSpinModal } from './roulette/ExtraSpinModal'
import { Wheel } from './roulette/Wheel'
import { WinModal } from './roulette/WinModal'

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
	const [showExtraSpinModal, setShowExtraSpinModal] = useState(false)

	const { addWinner, incrementSpins, addGold, remainingSpins, totalSpins, decrementRemainingSpins } = useRouletteStore()

	// Подкрутка (для админа)
	const [overrideSegment, setOverrideSegment] = useState<string | null>(null)

	const segmentAngle = 360 / ROULETTE_SEGMENTS.length

	const spinWheel = () => {
		if (isSpinning) return

		// Определяем, является ли это бесплатное вращение (первое и единственное, которое даётся при входе)
		const isFreeSpin = totalSpins === 0 && remainingSpins === 1

		// Если нет оставшихся вращений и уже был хотя бы один спин (не бесплатный спин) - показываем предложение купить вращения без спина
		if (!isFreeSpin && remainingSpins === 0) {
			setShowExtraSpinModal(true)
			return
		}

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

				// Обновляем статистику
				incrementSpins()
				addGold(actualWinningSegment.gold)
				if (remainingSpins > 0) {
					decrementRemainingSpins()
				}

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

				// Определяем, какое модальное окно показать
				// Если это бесплатное вращение - показываем бонусное вращение, иначе обычное окно выигрыша
				if (isFreeSpin) {
					setShowExtraSpinModal(true)
				} else {
					setShowWinModal(true)
				}
			}
		}

		requestAnimationFrame(animate)
	}
	const handleCloseWinModal = () => {
		setShowWinModal(false)
		// С вероятностью 10% показать окно дополнительного вращения (только если есть вращения)
		if (remainingSpins > 0 && Math.random() < 0.1) {
			setShowExtraSpinModal(true)
		}
	}

	return (
		<div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
			{/* Колесо рулетки */}
			<Wheel
				rotation={rotation}
				isSpinning={isSpinning}
				segmentAngle={segmentAngle}
			/>

			{/* Кнопка вращения */}
			<Button
				onClick={spinWheel}
				disabled={isSpinning}
				variant="gold"
				size="xl"
				className={cn('w-full', isSpinning && 'opacity-50 cursor-not-allowed', !isSpinning && 'animate-pulse-gold')}
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
			<div className="text-guarantee">Гарантированная награда при каждом вращении</div>

			{/* Панель подкрутки (для тестирования) */}
			{/* {process.env.NODE_ENV === 'development' && (
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
			)} */}

			{/* Модальное окно выигрыша */}
			<WinModal
				isOpen={showWinModal}
				onClose={handleCloseWinModal}
				winAmount={winAmount}
			/>

			{/* Модальное окно дополнительного вращения */}
			<ExtraSpinModal
				isOpen={showExtraSpinModal}
				onClose={() => setShowExtraSpinModal(false)}
			/>
		</div>
	)
}
