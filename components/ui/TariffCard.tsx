'use client'

import Image from 'next/image'

interface TariffCardProps {
	icon: string
	title: string
	mainText: string
	bonus?: string | null
	chanceText?: string | null
	price: string
	buttonText: string
	onSelect: () => void
	className?: string
}

export function TariffCard({ icon, title, mainText, bonus, chanceText, price, buttonText, onSelect, className = '' }: TariffCardProps) {
	return (
		<div
			className={`rounded-2xl p-8 shadow-2xl flex flex-col items-center ${className}`}
			style={{
				background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
				borderRadius: '20px',
				outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
				outlineOffset: '-1px'
			}}
			role="group"
			aria-label={`Тариф ${title}: ${mainText}, цена ${price}`}
		>
			{/* Иконка */}
			<div className="relative w-24 h-24">
				<Image
					src={icon}
					alt=""
					fill
					className="object-contain"
				/>
			</div>
			{/* Заголовок (Стандарт/Выгодный/Премиум/Люкс) */}
			<h2 className="text-slide-title mb-1 text-center">{title}</h2>
			{/* Разделительная линия */}
			<div className="w-full h-px bg-white/40 my-2" />
			{/* Основной текст (1 Вращение / 3 Вращения и т.д.) */}
			<p className="text-slide-main mb-6">{mainText}</p>
			{/* Бонус (если есть) */}
			{bonus && <p className="py-2.5 w-full text-center bg-gradient-bonus text-slide-bonus">{bonus}</p>}
			{/* Блок с градиентом и текстом шанса */}
			<div className="w-full pb-3 mb-4 flex items-center justify-center">
				<span className="text-slide-chance">{chanceText}</span>
			</div>
			<div className="text-center">
				<span className="text-slide-price">{price}</span>
			</div>
			{/* Кнопка */}
			<div className="flex items-center justify-between w-full">
				<button
					type="button"
					onClick={onSelect}
					className="px-12 py-3 w-full transition-colors btn-gold-slide"
					aria-label={`Выбрать тариф ${title} за ${price}`}
				>
					{buttonText}
				</button>
			</div>
		</div>
	)
}
