'use client'

import { FeatureBlock } from '@/components/ui/FeatureBlock'
import { NavButton } from '@/components/ui/NavButton'
import { RecentWins } from '@/components/ui/RecentWins'
import { TariffCard } from '@/components/ui/TariffCard'
import constants from '@/data/constants.json'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function SliderPage() {
	const [currentSlide, setCurrentSlide] = useState(1) // 0-based index, но слайдер на 2 слайдере (индекс 1)
	const [touchStartX, setTouchStartX] = useState<number | null>(null)
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [hintOffset, setHintOffset] = useState(0)
	const [hintActive, setHintActive] = useState(true)
	const [currentWinIndex, setCurrentWinIndex] = useState(0)
	const [isResetting, setIsResetting] = useState(false)
	const router = useRouter()

	// Создаём расширенный массив для бесконечной анимации
	const extendedWins = React.useMemo(() => {
		return [...constants.recentWins, ...constants.recentWins.slice(0, 3)]
	}, [constants.recentWins])

	// Анимация ротации последних выигрышей
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentWinIndex(prev => {
				const next = prev + 1
				// Если дошли до конца оригинального массива, сбросим на 0
				if (next > constants.recentWins.length) {
					setIsResetting(true)
					return 0
				}
				return next
			})
		}, 2000) // каждые 2 секунды
		return () => clearInterval(interval)
	}, [constants.recentWins.length])

	// После сброса включаем обратно transition
	useEffect(() => {
		if (isResetting) {
			const timer = setTimeout(() => setIsResetting(false), 50)
			return () => clearTimeout(timer)
		}
	}, [isResetting])

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
		if (distance > swipeThreshold) {
			nextSlide()
		} else if (distance < -swipeThreshold) {
			prevSlide()
		}
		setDragOffset(0)
		setTouchStartX(null)
	}

	// Анимация-подсказка свайпа для первого слайда (индекс 1) в течение 60 секунд
	useEffect(() => {
		if (!hintActive) return
		const duration = 60000 // 60 секунд
		const interval = 200 // смена направления каждые 0.2 секунды
		let direction = 1 // 1 для вправо, -1 для влево
		let elapsed = 0

		const hintInterval = setInterval(() => {
			setHintOffset(prev => {
				// Меняем направление при достижении ±5px
				const newOffset = prev + direction * 2
				if (Math.abs(newOffset) > 5) {
					direction *= -1
					return prev + direction * 2
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
				className="relative w-full max-w-4xl overflow-visible h-[500px]"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				role="region"
				aria-label="Тарифы на дополнительные вращения"
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
			<div className="mt-20 grid grid-cols-2 gap-2.5 w-full max-w-4xl">
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

			{/* Блок "Последние выигрыши" с анимацией */}
			<RecentWins
				wins={constants.recentWins}
				currentIndex={currentWinIndex}
				isResetting={isResetting}
			/>
		</main>
	)
}
