'use client'

import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ExtraSpinModalProps {
	onClose: () => void
	isOpen: boolean
}

export function ExtraSpinModal({ onClose, isOpen }: ExtraSpinModalProps) {
	const router = useRouter()

	if (!isOpen) return null

	const handleGetBonus = () => {
		onClose()
		router.push('/slider') // переход на страницу с тарифами
	}

	const titleId = 'extra-spin-modal-title'
	const descriptionId = 'extra-spin-modal-description'

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-xs"
				onClick={onClose}
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
				{/* Иконка gift.png */}
				<div className="relative w-25 h-25">
					<Image
						src="/gift.png"
						alt=""
						role="presentation"
						width={100}
						height={100}
						className="object-contain"
					/>
				</div>

				{/* Разделительная линия */}
				<div className="w-full h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200" />

				{/* Текст "Вам доступно бонусное вращение" */}
				<h2
					id={titleId}
					className="text-white-title"
				>
					Вам доступно бонусное вращение
				</h2>

				{/* Подтекст "Бонус активируется после покупки любого пакета" */}
				<p
					id={descriptionId}
					className="text-gray-subtext"
				>
					Бонус активируется после покупки любого пакета
				</p>

				{/* Кнопка "Получить бонус" */}
				<Button
					onClick={handleGetBonus}
					variant="gold"
					className="w-full"
					aria-label="Получить бонусное вращение"
				>
					Получить бонус
				</Button>
			</div>
		</div>
	)
}
