'use client'

import { Button } from '@/components/ui/Button'
import { getRandomSegment, ROULETTE_CONFIG, ROULETTE_SEGMENTS } from '@/config/roulette'
import constants from '@/data/constants.json'
import { useAudio } from '@/lib/hooks/useAudio'
import { usePurchasesStore } from '@/lib/store/purchases'
import { useRouletteStore } from '@/lib/store/roulette'
import { useUserStore } from '@/lib/store/user'
import { cn } from '@/lib/utils'
import { telegramService } from '@/services/telegram/telegram.service'
import { RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ExtraSpinModal } from './roulette/ExtraSpinModal'
import { Wheel } from './roulette/Wheel'
import { WinModal } from './roulette/WinModal'

interface RouletteProps {
	onWin?: (gold: number, segment: string) => void
}

export function Roulette({ onWin }: RouletteProps) {
	const router = useRouter()
	const [rotation, setRotation] = useState(0)
	const [isSpinning, setIsSpinning] = useState(false)
	const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
	const [showWinModal, setShowWinModal] = useState(false)
	const [winAmount, setWinAmount] = useState(0)
	const [showExtraSpinModal, setShowExtraSpinModal] = useState(false)
	const [showTariffCompletedModal, setShowTariffCompletedModal] = useState(false)

	const { addWinner, incrementSpins, addGold, addTariffGold, resetTariffGold, tariffGold, remainingSpins, totalSpins, decrementRemainingSpins } =
		useRouletteStore()

	const { nickname } = useUserStore()
	const consumeSpin = usePurchasesStore(state => state.consumeSpin)

	// Аудио для вращения колеса
	const {
		play: playWheelSound,
		pause: pauseWheelSound,
		audioRef: wheelAudioRef
	} = useAudio({
		src: '/wheel2.mp3',
		volume: 0.4,
		loop: true
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

		// Вычисляем угол для этого сегмента
		const segmentIndex = ROULETTE_SEGMENTS.findIndex(s => s.id === winningSegment.id)

		// Центр сегмента находится в: segmentIndex * segmentAngle + segmentAngle / 2
		// Но в Wheel.tsx сегменты отрисованы со смещением +segmentAngle (строка 87)
		// transform: rotate(${index * segmentAngle + segmentAngle}deg)
		// Это означает, что сегмент с индексом 0 начинается не с 0°, а с segmentAngle градусов.
		// Дополнительная корректировка ANGLE_CORRECTION для совпадения визуального и вычисленного сегмента
		// Фактический центр сегмента с учётом смещения:
		const segmentCenterAngle = segmentIndex * segmentAngle + segmentAngle + ANGLE_CORRECTION + segmentAngle / 2

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

		// Определяем, является ли выигрыш золотым (10000 голды)
		const isGoldWin = winningSegment.gold === 10000

		// Таймер для показа модального окна
		let winTimer: NodeJS.Timeout | null = null

		// Показываем выигрыш через 8.5 секунд (до остановки рулетки) только для золотого выигрыша
		if (isGoldWin) {
			winTimer = setTimeout(() => {
				if (!winModalShown) {
					winModalShown = true
					setShowWinModal(true)
				}
			}, 9000)
		}

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
				// Первые 10000 голды (гарантированный выигрыш) не учитываются в статистике
				const isFirstGoldWin = totalSpins === 0 && actualWinningSegment.id === 'gold'
				if (!isFirstGoldWin) {
					addGold(actualWinningSegment.gold)
					addTariffGold(actualWinningSegment.gold)
				}

				// Добавляем победителя
				const winnerGold = isFirstGoldWin ? 0 : actualWinningSegment.gold
				const winner = {
					id: Date.now().toString(),
					username: nickname || `Player${Math.floor(Math.random() * 9000) + 1000}`,
					gold: winnerGold,
					timestamp: Date.now(),
					segment: actualWinningSegment.label
				}
				addWinner(winner)

				// Декрементируем оставшиеся вращения, если они есть
				let newRemaining = remainingSpins
				if (remainingSpins > 0) {
					decrementRemainingSpins()
					// Уменьшаем количество вращений в purchases store
					if (nickname) {
						consumeSpin(nickname)
					}
					// Проверяем, закончились ли вращения
					newRemaining = useRouletteStore.getState().remainingSpins
					if (newRemaining === 0) {
						// Отправляем уведомление о выигрыше за весь тариф
						const totalTariffGold = useRouletteStore.getState().tariffGold
						telegramService.sendWinNotification(winner.username, totalTariffGold).catch((err: any) => {
							console.error('Ошибка отправки уведомления в Telegram:', err)
						})
						// Показываем модальное окно с итогами тарифа
						setShowTariffCompletedModal(true)
						// НЕ сбрасываем накопленное золото тарифа, чтобы пользователь видел итоговую сумму
						// resetTariffGold()
					}
				}

				onWin?.(winnerGold, actualWinningSegment.label)

				// Подкрутка остаётся (не сбрасываем)

				// Очищаем таймер (если он был установлен)
				if (winTimer) {
					clearTimeout(winTimer)
				}

				// Показываем окно выигрыша, если ещё не показано и это не последнее вращение тарифа
				const isLastSpinOfTariff = remainingSpins > 0 && newRemaining === 0
				if (!winModalShown && !isLastSpinOfTariff) {
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
		// Показываем бонусное окно только если это первое вращение и осталось 0 вращений
		if (remainingSpins === 0 && totalSpins === 1) {
			setShowExtraSpinModal(true)
		}
	}

	const handleTariffCompletedClose = () => {
		setShowTariffCompletedModal(false)

		// Сбрасываем накопленное золото тарифа перед переходом к выбору нового тарифа
		resetTariffGold()

		// Перенаправляем на страницу выбора тарифа
		router.push('/slider')
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
			{(() => {
				// Вычисляем голды за тариф (первые 10000 голды не учитываются)
				const displayGold = tariffGold
				const showBlock = displayGold > 0
				return showBlock ? (
					<div className="text-guarantee text-gold-light">
						Голды выиграно: <span className="font-bold">{displayGold}</span>
					</div>
				) : null
			})()}

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

			{/* Модальное окно завершения тарифа */}
			{showTariffCompletedModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
					<div
						className="relative w-[90%] max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center"
						style={{
							background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
							borderRadius: '20px',
							outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
							outlineOffset: '-1px'
						}}
					>
						{/* Заголовок */}
						<h2 className="text-win-title mb-4 text-center">Тариф завершён!</h2>
						{/* Подзаголовок */}
						<p className="text-gray-subtext text-center mb-3">Вы использовали все вращения тарифа.</p>
						<p className="text-gray-subtext text-center mb-6">
							Голды выиграно: <span className="text-stat-value">{tariffGold}</span>
						</p>
						{/* кнопка */}
						<div className="flex flex-col w-full">
							<Button
								onClick={handleTariffCompletedClose}
								variant="gold"
								size="xl"
								className="w-full text-xl"
							>
								Продолжить
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
