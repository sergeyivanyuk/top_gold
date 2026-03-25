import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface WinModalProps {
	winAmount: number
	onClose: () => void
	isOpen: boolean
}

export function WinModal({ winAmount, onClose, isOpen }: WinModalProps) {
	if (!isOpen) return null

	const isBigWin = winAmount >= 10000
	const title = isBigWin ? 'Вы выиграли!' : 'почти повезло!'
	const amountClass = isBigWin ? 'text-big-gold' : 'text-win-amount-low'

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-xs"
				onClick={onClose}
			/>
			<div className="relative p-5 text-center max-w-sm w-full flex flex-col items-center gap-5 rounded-card bg-radial-gold border-gold-light outline-offset-[-2px]">
				{/* Заголовок */}
				<p className="text-center text-win-title">{title}</p>

				{/* Подтекст */}
				<p className="text-center text-gray-subtext">Выигрыш будет зачислен на ваш аккаунт в&nbsp;течении 24ч!</p>

				{/* Разделительная линия */}
				<div className="w-full h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200" />

				{/* Выигрыш + иконка */}
				<div className="flex items-center justify-center">
					<p className={amountClass}>{winAmount.toLocaleString()}</p>
					<div className="relative w-[60px] h-[60px]">
						<Image
							src="/golds.svg"
							alt="Gold"
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
				>
					Забрать и продолжить
				</Button>
			</div>
		</div>
	)
}
