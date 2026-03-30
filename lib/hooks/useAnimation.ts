import { useRef, useCallback, useEffect } from 'react'

interface UseAnimationOptions {
	duration: number
	easing?: (t: number) => number
	onUpdate: (progress: number, value: number) => void
	onComplete?: () => void
}

/**
 * Хук для плавной анимации значения от начального до конечного
 * @param options - настройки анимации
 * @returns функции запуска и остановки анимации
 */
export function useAnimation(options: UseAnimationOptions) {
	const animationRef = useRef<number | null>(null)
	const startTimeRef = useRef<number | null>(null)
	const startValueRef = useRef<number>(0)
	const endValueRef = useRef<number>(1)

	const stop = useCallback(() => {
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current)
			animationRef.current = null
		}
		startTimeRef.current = null
	}, [])

	const animate = useCallback(
		(startValue: number, endValue: number) => {
			stop()

			startValueRef.current = startValue
			endValueRef.current = endValue
			startTimeRef.current = Date.now()

			const step = () => {
				if (!startTimeRef.current) return

				const elapsed = Date.now() - startTimeRef.current
				const progress = Math.min(elapsed / options.duration, 1)

				const ease = options.easing || ((t: number) => t)
				const easedProgress = ease(progress)

				const currentValue = startValueRef.current + (endValueRef.current - startValueRef.current) * easedProgress

				options.onUpdate(progress, currentValue)

				if (progress < 1) {
					animationRef.current = requestAnimationFrame(step)
				} else {
					animationRef.current = null
					options.onComplete?.()
				}
			}

			animationRef.current = requestAnimationFrame(step)
		},
		[options.duration, options.easing, options.onUpdate, options.onComplete, stop]
	)

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			stop()
		}
	}, [stop])

	return {
		animate,
		stop,
		isAnimating: animationRef.current !== null
	}
}
