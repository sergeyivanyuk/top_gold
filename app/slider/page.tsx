'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SliderPage() {
	const [currentSlide, setCurrentSlide] = useState(1) // 0-based index, но слайдер на 2 слайдере (индекс 1)
	const [touchStartX, setTouchStartX] = useState<number | null>(null)
	const router = useRouter()

	const slides = [
		{
			icon: '/golds.svg',
			title: 'Стандарт',
			mainText: '1 Вращение',
			bonus: 'ШАНСЫ ЕСТЬ',
			chanceText: null,
			price: '179₽',
			buttonText: 'Выбрать'
		},
		{
			icon: '/super.svg',
			title: 'Выгодный',
			mainText: '3 Вращения',
			bonus: '+1 Бонусное вращение',
			chanceText: 'Отличный шанс!',
			price: '537₽',
			buttonText: 'Выбрать'
		},
		{
			icon: '/premium.svg',
			title: 'Премиум',
			mainText: '5 Вращений',
			bonus: '+2 Бонусных вращения',
			chanceText: 'Идеальный шанс!',
			price: '825₽',
			buttonText: 'выбрать'
		},
		{
			icon: '/lux.svg',
			title: 'Люкс',
			mainText: '8 Вращений',
			bonus: '+3 Бонусных вращения',
			chanceText: 'Секретный шанс!',
			price: '1479₽',
			buttonText: 'выбрать'
		}
	]

	const nextSlide = () => {
		setCurrentSlide(prev => (prev + 1) % slides.length)
	}

	const prevSlide = () => {
		setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
	}

	const handleSelectTariff = (slide: any) => {
		const params = new URLSearchParams({
			tariff: slide.title,
			price: slide.price.replace('₽', '')
		})
		router.push(`/payment?${params.toString()}`)
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStartX(e.touches[0].clientX)
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!touchStartX) return
		const touchEndX = e.changedTouches[0].clientX
		const distance = touchStartX - touchEndX
		const swipeThreshold = 50
		if (distance > swipeThreshold) {
			nextSlide()
		} else if (distance < -swipeThreshold) {
			prevSlide()
		}
		setTouchStartX(null)
	}

	const getSlideStyle = (index: number) => {
		const diff = index - currentSlide
		const absDiff = Math.abs(diff)

		let translateX = 0
		let scale = 1
		let opacity = 1
		let zIndex = 10

		if (absDiff === 0) {
			// активный слайд
			translateX = 0
			scale = 1
			opacity = 1
			zIndex = 30
		} else if (absDiff === 1) {
			// соседние слайды
			translateX = diff * 70 // процентов от ширины слайда
			scale = 0.85
			opacity = 0.7
			zIndex = 20
		} else {
			// дальние слайды
			translateX = diff * 100
			scale = 0.6
			opacity = 0.3
			zIndex = 10
		}

		return {
			transform: `translateX(${translateX}%) scale(${scale})`,
			opacity,
			zIndex,
			transition: 'transform 0.3s, opacity 0.3s'
		}
	}

	return (
		<main className="flex flex-col items-center justify-start p-4 overflow-x-hidden">
			{/* Заголовок страницы */}
			<h1 className="text-2xl font-bold mb-1 text-white">Дополнительные вращения</h1>
			<p className="mb-10 text-gray-subtext">Каждое вращение - гарантированная награда</p>

			{/* Слайдер */}
			<div
				className="relative w-full max-w-4xl overflow-visible h-[500px]"
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
			>
				<div className="flex items-center justify-center h-full relative">
					{slides.map((slide, index) => {
						const style = getSlideStyle(index)
						return (
							<div
								key={index}
								className="absolute w-[280px] transition-all duration-300"
								style={{
									...style,
									left: '50%',
									transform: `translateX(-50%) ${style.transform}`
								}}
							>
								<div
									className="rounded-2xl p-8 shadow-2xl flex flex-col items-center"
									style={{
										background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
										borderRadius: '20px',
										outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
										outlineOffset: '-1px'
									}}
								>
									{/* Иконка */}
									<div className="relative w-24 h-24">
										<Image
											src={slide.icon}
											alt=""
											fill
											className="object-contain"
										/>
									</div>
									{/* Заголовок (Стандарт/Выгодный/Премиум/Люкс) */}
									<h2 className="text-slide-title mb-1 text-center">{slide.title}</h2>
									{/* Разделительная линия */}
									<div className="w-full h-px bg-white/40 my-2" />
									{/* Основной текст (1 Вращение / 3 Вращения и т.д.) */}
									<p className="text-slide-main mb-6">{slide.mainText}</p>
									{/* Бонус (если есть) */}
									{slide.bonus && <p className="py-2.5 w-full text-center bg-gradient-bonus text-slide-bonus">{slide.bonus}</p>}
									{/* Блок с градиентом и текстом шанса */}
									<div className="w-full pb-3 mb-4 flex items-center justify-center">
										<span className="text-slide-chance">{slide.chanceText}</span>
									</div>
									<div className="text-center">
										<span className="text-slide-price">{slide.price}</span>
									</div>
									{/*кнопка*/}
									<div className="flex items-center justify-between w-full">
										<button
											onClick={() => handleSelectTariff(slide)}
											className="px-12 py-3 w-full transition-colors btn-gold-slide"
										>
											{slide.buttonText}
										</button>
									</div>
								</div>
							</div>
						)
					})}
				</div>

				{/* Кнопки переключения */}
				<div className="flex justify-center items-center mt-2.5 gap-2.5">
					<button
						onClick={prevSlide}
						className="btn-nav"
					>
						<ChevronLeft className="text-[#fff] font-bold w-8 h-8" />
					</button>
					<button
						onClick={nextSlide}
						className="btn-nav"
					>
						<ChevronRight className="text-[#fff] font-bold w-8 h-8" />
					</button>
				</div>
			</div>

			{/* Блоки "Официальное начисление" и "Работаем с 2023 года" */}
			<div className="mt-20 grid grid-cols-2 gap-2.5 w-full max-w-4xl">
				{/* Блок 1 */}
				<div className="flex flex-col items-center px-6 py-4 rounded-card bg-radial-gold border-gold-light outline-offset-[-1px]">
					<div className="relative w-12 h-12">
						<Image
							src="/official.svg"
							alt="Официальное"
							fill
							className="object-contain"
						/>
					</div>
					<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
					<span className="text-center text-secondary-title">Официальное начисление</span>
				</div>

				{/* Блок 2 */}
				<div className="flex flex-col items-center px-6 py-4 rounded-card bg-radial-gold border-gold-light outline-offset-[-1px]">
					<div className="relative w-12 h-12">
						<Image
							src="/clock.svg"
							alt="Работаем с 2023"
							fill
							className="object-contain"
						/>
					</div>
					<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
					<span className="text-center text-secondary-title">Работаем с 2023 года</span>
				</div>
			</div>
			{/* Блок "Последние выигрыши" */}
			<div className="flex flex-col items-center px-6 py-4 rounded-card mt-5 w-full bg-radial-gold border-gold-light outline-offset-[-1px]">
				<span className="text-center text-secondary-title mb-2.5">Последние выигрыши</span>
				<div className="items w-full flex flex-col gap-3">
					<div className="flex items-center justify-between w-full">
						<span className="text-center text-base font-medium text-white">User213123123</span>
						<div className="flex items-center">
							<span className="text-stat-value">11 150</span>
							<Image
								src="/golds.svg"
								alt="голда"
								width={20}
								height={20}
							/>
						</div>
					</div>
					<div className="self-stretch h-0 opacity-50 outline-1 outline-offset-[-0.50px] outline-orange-300" />
					<div className="flex items-center justify-between w-full">
						<span className="text-center text-base font-medium text-white">User213123123</span>
						<div className="flex items-center">
							<span className="text-stat-value">11 150</span>
							<Image
								src="/golds.svg"
								alt="голда"
								width={20}
								height={20}
							/>
						</div>
					</div>
					<div className="self-stretch h-0 opacity-50 outline-1 outline-offset-[-0.50px] outline-orange-300" />
					<div className="flex items-center justify-between w-full">
						<span className="text-center text-base font-medium text-white">User213123123</span>
						<div className="flex items-center">
							<span className="text-stat-value">11 150</span>
							<Image
								src="/golds.svg"
								alt="голда"
								width={20}
								height={20}
							/>
						</div>
					</div>
					<div className="self-stretch h-0 opacity-50 outline-1 outline-offset-[-0.50px] outline-orange-300" />
				</div>
			</div>
		</main>
	)
}
