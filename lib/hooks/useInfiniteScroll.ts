import { useEffect, useState, useCallback } from 'react'

interface UseInfiniteScrollOptions {
	itemCount: number
	itemsPerView?: number
	intervalMs?: number
	autoPlay?: boolean
}

/**
 * Хук для бесконечной прокрутки списка с автоматическим переключением.
 * Возвращает текущий индекс, флаг сброса и функцию для ручного управления.
 */
export function useInfiniteScroll({ itemCount, itemsPerView = 3, intervalMs = 2000, autoPlay = true }: UseInfiniteScrollOptions) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isResetting, setIsResetting] = useState(false)

	// Расширенное количество элементов для бесшовной анимации
	const extendedCount = itemCount + itemsPerView

	const goToNext = useCallback(() => {
		setCurrentIndex(prev => {
			const next = prev + 1
			// Если дошли до конца расширенного массива, сбрасываем на 0
			if (next >= extendedCount) {
				setIsResetting(true)
				return 0
			}
			return next
		})
	}, [extendedCount])

	const goToPrev = useCallback(() => {
		setCurrentIndex(prev => {
			const next = prev - 1
			// Если ушли в отрицательные, переходим к концу расширенного массива
			if (next < 0) {
				setIsResetting(true)
				return extendedCount - 1
			}
			return next
		})
	}, [extendedCount])

	const reset = useCallback(() => {
		setIsResetting(true)
		setCurrentIndex(0)
	}, [])

	// Автоматическое переключение
	useEffect(() => {
		if (!autoPlay) return

		const interval = setInterval(goToNext, intervalMs)
		return () => clearInterval(interval)
	}, [autoPlay, intervalMs, goToNext])

	// Сброс флага isResetting после следующего рендера
	useEffect(() => {
		if (isResetting) {
			const timer = setTimeout(() => setIsResetting(false), 50)
			return () => clearTimeout(timer)
		}
	}, [isResetting])

	return {
		currentIndex,
		isResetting,
		goToNext,
		goToPrev,
		reset,
		extendedCount
	}
}
