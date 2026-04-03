import { Button } from '@/components/ui/Button'
import { useAudio } from '@/lib/hooks/useAudio'
import Image from 'next/image'
import { useEffect } from 'react'

interface WinModalProps {
	winAmount: number
	onClose: () => void
	isOpen: boolean
}

export function WinModal({ winAmount, onClose, isOpen }: WinModalProps) {
	const isBigWin = winAmount >= 5000

	// Аудио для выигрыша
	const { play: playWinSound } = useAudio({
		src: '/win.mp3',
		volume: 0.7
	})

	// Аудио для проигрыша
	const { play: playLoseSound } = useAudio({
		src: '/proval.mp3',
		volume: 0.7
	})

	// Воспроизведение звука при открытии модального окна
	useEffect(() => {
		if (isOpen) {
			if (isBigWin) {
				playWinSound()
			} else {
				playLoseSound()
			}
		}
	}, [isOpen, isBigWin, playWinSound, playLoseSound])

	if (!isOpen) return null

	const title = isBigWin ? 'Вы выиграли!' : 'почти повезло!'
	const amountClass = isBigWin ? 'text-big-gold' : 'text-win-amount-low'
	const titleId = 'win-modal-title'
	const descriptionId = 'win-modal-description'

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-xs"
				aria-hidden="true"
			/>
			{/* Modal */}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className="relative p-5 text-center max-w-sm w-full flex flex-col items-center gap-5 rounded-card bg-radial-gold border-gold-light outline-offset-[-2px]"
			>
				{/* Заголовок */}
				<h2
					id={titleId}
					className="text-center text-win-title"
				>
					{title}
				</h2>

				{/* Подтекст */}
				<p
					id={descriptionId}
					className="text-center text-gray-subtext"
				>
					Выигрыш будет зачислен на ваш аккаунт в&nbsp;течении 24ч!
				</p>

				{/* Разделительная линия */}
				<div className="w-full h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200" />

				{/* Выигрыш + иконка */}
				<div className="flex items-center justify-center">
					<p className={amountClass}>{winAmount.toLocaleString()}</p>
					<div className="relative w-[60px] h-[60px]">
						<Image
							src="/golds.png"
							alt=""
							role="presentation"
							fill
							sizes="60px"
							className="object-contain"
						/>
					</div>
				</div>

				{/* Подтекст "голды" */}
				<p className="text-secondary-title mt-[-25px]">голды</p>

				{/* Кнопка */}
				<Button
					onClick={onClose}
					variant="gold"
					className="win-modal-button"
					aria-label="Забрать выигрыш и продолжить"
				>
					Забрать и продолжить
				</Button>
			</div>
		</div>
	)
}
