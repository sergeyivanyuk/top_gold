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

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-xs"
				onClick={onClose}
			/>
			<div className="relative p-5 text-center max-w-sm w-full flex flex-col items-center gap-5 rounded-card bg-radial-gold border-gold-light outline-offset-[-2px]">
				{/* Иконка gift.svg */}
				<div className="relative w-[100px] h-[100px]">
					<Image
						src="/gift.svg"
						alt="Подарок"
						fill
						sizes="100px"
						className="object-contain"
					/>
				</div>

				{/* Разделительная линия */}
				<div className="w-full h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200" />

				{/* Текст "Вам доступно бонусное вращение" */}
				<p className="text-white-title">Вам доступно бонусное вращение</p>

				{/* Подтекст "Бонус активируется после покупки любого пакета" */}
				<p className="text-gray-subtext">Бонус активируется после покупки любого пакета</p>

				{/* Кнопка "Получить бонус" */}
				<Button
					onClick={handleGetBonus}
					variant="gold"
					className="w-full"
				>
					Получить бонус
				</Button>
			</div>
		</div>
	)
}
