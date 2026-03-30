'use client'

import { Button } from '@/components/ui/Button'
import { getRandomSegment, ROULETTE_CONFIG, ROULETTE_SEGMENTS } from '@/config/roulette'
import constants from '@/data/constants.json'
import { useAudio } from '@/lib/hooks/useAudio'
import { useRouletteStore } from '@/lib/store/roulette'
import { cn } from '@/lib/utils'
import { telegramService } from '@/services/telegram/telegram.service'
import { RotateCw } from 'lucide-react'
import { useState } from 'react'
import { ExtraSpinModal } from './roulette/ExtraSpinModal'
import { Wheel } from './roulette/Wheel'
import { WinModal } from './roulette/WinModal'

interface RouletteProps {
	onWin?: (gold: number, segment: string) => void
}

export function Roulette({ onWin }: RouletteProps) {
	const [rotation, setRotation] = useState(0)
	const [isSpinning, setIsSpinning] = useState(false)
	const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
	const [showWinModal, setShowWinModal] = useState(false)
	const [winAmount, setWinAmount] = useState(0)
	const [showExtraSpinModal, setShowExtraSpinModal] = useState(false)

	const { addWinner, incrementSpins, addGold, addTariffGold, resetTariffGold, tariffGold, remainingSpins, totalSpins, decrementRemainingSpins } =
		useRouletteStore()

	// Аудио для вращения колеса
	const {
		play: playWheelSound,
		pause: pauseWheelSound,
		audioRef: wheelAudioRef
	} = useAudio({
		src: '/wheel.mp3',
		volume: 0.4,
		loop: true
	})

	// Аудио для нажатия кнопки
	const { play: playButtonSound, audioRef: buttonAudioRef } = useAudio({
		src: '/button.mp3',
		volume: 0.4
	})

	// Подкрутка (для админа) - значение берётся из конфигурационного файла data/constants.json
	// Возможные значения: 'gold', 'black1', 'black2', 'black3', 'blue1', 'blue2', 'blue3', 'red1', 'red2', 'red3'
	// null - отключить подкрутку
	const [overrideSegment, setOverrideSegment] = useState<string | null>(constants.roulette.overrideSegmentId)

	const segmentAngle = 360 / ROULETTE_SEGMENTS.length

	const spinWheel = () => {
		if (isSpinning) return

		setIsSpinning(true)
		setSelectedSegment(null)

		// Дополнительная корректировка угла для совпадения визуального и вычисленного сегмента
		const ANGLE_CORRECTION = -11 // градусов, подобрано эмпирически

		console.log('totalSpins:', totalSpins)

		// Воспроизведение звука кнопки
		playButtonSound()

		// Воспроизведение звука вращения
		playWheelSound()

		// Определяем выигрышный сегмент
		// Первая крутка всегда даёт золотой сегмент (10000)
		let winningSegment
		if (totalSpins === 0) {
			const goldSegment = ROULETTE_SEGMENTS.find(s => s.id === 'gold')
			if (!goldSegment) {
				console.error('Золотой сегмент не найден в ROULETTE_SEGMENTS')
				winningSegment = getRandomSegment(overrideSegment || undefined)
			} else {
				winningSegment = goldSegment
			}
		} else {
			winningSegment = getRandomSegment(overrideSegment || undefined)
		}

		console.log('Выбран сегмент (вероятностно):', winningSegment.id, 'gold:', winningSegment.gold)

		// Вычисляем угол для этого сегмента
		const segmentIndex = ROULETTE_SEGMENTS.findIndex(s => s.id === winningSegment.id)

		// Центр сегмента находится в: segmentIndex * segmentAngle + segmentAngle / 2
		// Но в Wheel.tsx сегменты отрисованы со смещением +segmentAngle (строка 87)
		// transform: rotate(${index * segmentAngle + segmentAngle}deg)
		// Это означает, что сегмент с индексом 0 начинается не с 0°, а с segmentAngle градусов.
		// Дополнительная корректировка ANGLE_CORRECTION для совпадения визуального и вычисленного сегмента
		// Фактический центр сегмента с учётом смещения:
		const segmentCenterAngle = segmentIndex * segmentAngle + segmentAngle + ANGLE_CORRECTION + segmentAngle / 2
		console.log('segmentIndex:', segmentIndex, 'segmentCenterAngle:', segmentCenterAngle)

		// Добавляем несколько полных оборотов + небольшое случайное смещение внутри сегмента
		let spins = ROULETTE_CONFIG.MIN_SPINS
		let randomOffset = (Math.random() - 0.5) * segmentAngle * 0.6 // ±30% от сегмента

		// Если включена подкрутка, убираем случайности для точного попадания
		if (overrideSegment) {
			spins = ROULETTE_CONFIG.MIN_SPINS // фиксированное количество оборотов
			randomOffset = 0 // без смещения
		} else {
			spins += Math.floor(Math.random() * 3) // добавляем случайные обороты для естественности
		}

		// Точное вычисление угла для гарантированного попадания в сегмент (особенно при подкрутке)
		const currentMod = rotation % 360
		const desiredMod = (360 - segmentCenterAngle) % 360
		let diff = (desiredMod - currentMod + 360) % 360
		// Если diff равен 0, добавляем полный оборот, чтобы колесо всё равно повернулось
		if (diff === 0) diff = 360

		const totalRotation = rotation + spins * 360 + diff + randomOffset

		// Устанавливаем выигрышную сумму и сегмент сразу (для раннего показа)
		setWinAmount(winningSegment.gold)
		setSelectedSegment(winningSegment.id)

		// Анимация
		const duration = ROULETTE_CONFIG.SPIN_DURATION
		const startTime = Date.now()
		const startRotation = rotation

		// Флаг, чтобы не показывать модальное окно дважды
		let winModalShown = false

		// Показываем выигрыш через 8.5 секунд (до остановки рулетки)
		const winTimer = setTimeout(() => {
			if (!winModalShown) {
				winModalShown = true
				setShowWinModal(true)
			}
		}, 8500)

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
				// Корректируем угол с учётом смещения сегментов в Wheel.tsx (сегмент 0 начинается с segmentAngle градусов)
				// и корректировки ANGLE_CORRECTION, которая уже учтена в segmentCenterAngle
				const adjustedAngle = (pointerAngle - ANGLE_CORRECTION - segmentAngle + 720) % 360
				const winningIndex = Math.floor(adjustedAngle / segmentAngle)
				const actualWinningSegment = ROULETTE_SEGMENTS[winningIndex]

				console.log('Финальный угол вращения:', finalRotation)
				console.log('Угол под стрелкой:', pointerAngle)
				console.log('Скорректированный угол:', adjustedAngle)
				console.log('Индекс сегмента:', winningIndex)
				console.log('Фактический сегмент:', actualWinningSegment.id, 'gold:', actualWinningSegment.gold)
				console.log('Ожидался сегмент:', winningSegment.id, 'gold:', winningSegment.gold)

				setIsSpinning(false)
				setSelectedSegment(actualWinningSegment.id)
				setWinAmount(actualWinningSegment.gold)

				// Остановка звука вращения
				pauseWheelSound()
				if (wheelAudioRef.current) {
					wheelAudioRef.current.currentTime = 0
				}

				// Обновляем статистику
				incrementSpins()
				addGold(actualWinningSegment.gold)
				addTariffGold(actualWinningSegment.gold)

				// Добавляем победителя
				const winner = {
					id: Date.now().toString(),
					username: `Player${Math.floor(Math.random() * 9000) + 1000}`,
					gold: actualWinningSegment.gold,
					timestamp: Date.now(),
					segment: actualWinningSegment.label
				}
				addWinner(winner)

				// Декрементируем оставшиеся вращения, если они есть
				if (remainingSpins > 0) {
					decrementRemainingSpins()
					// Проверяем, закончились ли вращения
					const newRemaining = useRouletteStore.getState().remainingSpins
					if (newRemaining === 0) {
						// Отправляем уведомление о выигрыше за весь тариф
						const totalTariffGold = useRouletteStore.getState().tariffGold
						telegramService.sendWinNotification(winner.username, totalTariffGold).catch((err: any) => {
							console.error('Ошибка отправки уведомления в Telegram:', err)
						})
						// Сбрасываем накопленное золото тарифа
						resetTariffGold()
					}
				}

				onWin?.(actualWinningSegment.gold, actualWinningSegment.label)

				// Подкрутка остаётся (не сбрасываем)

				// Очищаем таймер
				clearTimeout(winTimer)

				// Показываем окно выигрыша, если ещё не показано
				if (!winModalShown) {
					winModalShown = true
					setShowWinModal(true)
				}
			}
		}

		requestAnimationFrame(animate)
	}
	const handleCloseWinModal = () => {
		setShowWinModal(false)
		// После закрытия окна выигрыша показываем бонусное окно только при первом вращении
		const { remainingSpins, totalSpins } = useRouletteStore.getState()
		// Показываем бонусное окно только если это первое вращение, осталось 0 вращений и колесо не вращается
		if (remainingSpins === 0 && totalSpins === 1 && !isSpinning) {
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
				className={cn('w-full text-[25px]', isSpinning && 'opacity-50 cursor-not-allowed', !isSpinning && 'animate-pulse-gold')}
			>
				{isSpinning ? (
					<span className="flex items-center gap-2">
						<RotateCw className="w-5 h-5 animate-spin" />
						Вращаю...
					</span>
				) : (
					'Крутить рулетку'
				)}
			</Button>
			<div className="text-guarantee">Гарантированная награда при каждом вращении</div>

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
