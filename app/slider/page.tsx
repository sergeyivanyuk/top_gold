'use client'

import { FeatureBlock } from '@/components/ui/FeatureBlock'
import { NavButton } from '@/components/ui/NavButton'
import { TariffCard } from '@/components/ui/TariffCard'
import constants from '@/data/constants.json'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { RecentWins } from '../../components/ui/RecentWins'

export default function SliderPage() {
	const [currentSlide, setCurrentSlide] = useState(1) // 0-based index, но слайдер на 2 слайдере (индекс 1)
	const [touchStartX, setTouchStartX] = useState<number | null>(null)
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [hintOffset, setHintOffset] = useState(0)
	const [hintActive, setHintActive] = useState(true)
	const router = useRouter()

	const slides = [
		{
			icon: '/golds.png',
			title: 'Стандарт',
			mainText: '1 Вращение',
			bonus: 'ШАНСЫ ЕСТЬ',
			chanceText: null,
			price: '179₽',
			buttonText: 'Выбрать'
		},
		{
			icon: '/super.png',
			title: 'Выгодный',
			mainText: '3 Вращения',
			bonus: '+1 Бонусное вращение',
			chanceText: 'Отличный шанс!',
			price: '537₽',
			buttonText: 'Выбрать'
		},
		{
			icon: '/premium.png',
			title: 'Премиум',
			mainText: '5 Вращений',
			bonus: '+2 Бонусных вращения',
			chanceText: 'Идеальный шанс!',
			price: '825₽',
			buttonText: 'выбрать'
		},
		{
			icon: '/lux.png',
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
		const x = e.touches[0].clientX
		setTouchStartX(x)
		setStartX(x)
		setIsDragging(true)
		setDragOffset(0)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return
		const currentX = e.touches[0].clientX
		const diff = currentX - startX
		setDragOffset(diff)
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (!isDragging) return
		setIsDragging(false)
		const touchEndX = e.changedTouches[0].clientX
		const distance = touchEndX - startX
		const swipeThreshold = 50
		// Свайп вправо (положительное расстояние) -> предыдущий слайд
		if (distance > swipeThreshold) {
			prevSlide()
		} else if (distance < -swipeThreshold) {
			nextSlide()
		}
		setDragOffset(0)
		setTouchStartX(null)
	}

	// Анимация-подсказка свайпа для первого слайда (индекс 1) в течение 60 секунд
	useEffect(() => {
		if (!hintActive) return
		const duration = 60000 // 60 секунд
		const interval = 100 // интервал обновления (мс)
		let direction = 1 // 1 для вправо, -1 для влево
		let elapsed = 0
		const maxOffset = 15 // максимальное смещение в пикселях
		const baseSpeed = 4 // максимальная скорость (пикселей за шаг) в центре
		const minSpeed = 0.2 // минимальная скорость на краях

		const hintInterval = setInterval(() => {
			setHintOffset(prev => {
				// Линейная зависимость скорости от смещения (быстрее в центре, медленнее на краях)
				const speed = Math.max(minSpeed, baseSpeed * (1 - Math.abs(prev) / maxOffset))
				// Новое смещение с учетом направления и скорости
				let newOffset = prev + direction * speed
				// Если вышли за границы, меняем направление и отражаем смещение
				if (Math.abs(newOffset) > maxOffset) {
					direction *= -1
					// Отражаем излишек
					const overshoot = Math.abs(newOffset) - maxOffset
					newOffset = direction * (maxOffset - overshoot)
					// Гарантируем, что смещение остаётся в пределах
					if (Math.abs(newOffset) > maxOffset) {
						newOffset = direction * maxOffset
					}
				}
				return newOffset
			})
			elapsed += interval
			if (elapsed >= duration) {
				clearInterval(hintInterval)
				setHintActive(false)
				setHintOffset(0)
			}
		}, interval)

		return () => clearInterval(hintInterval)
	}, [hintActive])

	// Остановка анимации при переключении слайда
	useEffect(() => {
		if (currentSlide !== 1 && hintActive) {
			setHintActive(false)
			setHintOffset(0)
		}
	}, [currentSlide, hintActive])

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
			translateX = diff * 90 // процентов от ширины слайда
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

		// Добавляем смещение от драга
		let dragTranslate = 0
		if (isDragging) {
			// dragOffset в пикселях, переводим в проценты относительно ширины слайда (примерно 280px)
			// Для простоты добавим как translateX в пикселях
			dragTranslate = dragOffset
		}

		// Добавляем смещение для анимации-подсказки (только для слайда с индексом 1)
		let hintTranslate = 0
		if (hintActive && index === 1 && !isDragging) {
			hintTranslate = hintOffset
		}

		return {
			transform: `translateX(${translateX}%) translateX(${dragTranslate}px) translateX(${hintTranslate}px) scale(${scale})`,
			opacity,
			zIndex,
			transition: isDragging ? 'none' : 'transform 0.3s, opacity 0.3s'
		}
	}

	return (
		<main className="flex flex-col items-center justify-start p-4 overflow-x-hidden">
			{/* Заголовок страницы */}
			<h1 className="text-2xl font-bold mb-1 text-white">Дополнительные вращения</h1>
			<p className="mb-10 text-gray-subtext">Каждое вращение - гарантированная награда</p>

			{/* Слайдер */}
			<div
				className="relative w-full max-w-4xl overflow-visible h-[500px] slider"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				role="region"
				aria-label="Тарифы на дополнительные вращения"
			>
				<div className="flex items-center h-full justify-center slider-items relative">
					{slides.map((slide, index) => {
						const style = getSlideStyle(index)
						return (
							<div
								key={index}
								className="absolute w-[280px] transition-all duration-700 ease-in-out"
								style={{
									...style,
									left: '50%',
									transform: `translateX(-50%) ${style.transform}`
								}}
							>
								<TariffCard
									icon={slide.icon}
									title={slide.title}
									mainText={slide.mainText}
									bonus={slide.bonus}
									chanceText={slide.chanceText}
									price={slide.price}
									buttonText={slide.buttonText}
									onSelect={() => handleSelectTariff(slide)}
								/>
							</div>
						)
					})}
				</div>

				{/* Кнопки переключения */}
				<div className="flex justify-center items-center mt-2.5 gap-2.5">
					<NavButton
						direction="prev"
						onClick={prevSlide}
					/>
					<NavButton
						direction="next"
						onClick={nextSlide}
					/>
				</div>
			</div>

			{/* Блоки "Официальное начисление" и "Работаем с 2023 года" */}
			<div className="mt-20 grid grid-cols-2 gap-2.5 w-full max-w-4xl official">
				<FeatureBlock
					iconSrc="/official.png"
					iconAlt="Официальное"
					title="Официальное начисление"
				/>
				<FeatureBlock
					iconSrc="/clock.png"
					iconAlt="Работаем с 2023"
					title="Работаем с 2023 года"
				/>
			</div>
			{/* Блок с выйгрывшими */}
			<RecentWins
				wins={constants.recentWins}
				intervalMs={3000}
			/>
		</main>
	)
}
