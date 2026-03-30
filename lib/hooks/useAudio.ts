import { useEffect, useRef, useCallback } from 'react'

interface UseAudioOptions {
	src: string
	volume?: number
	loop?: boolean
	autoplay?: boolean
}

/**
 * Хук для управления воспроизведением аудио
 * @param options - настройки аудио
 * @returns методы управления аудио
 */
export function useAudio(options: UseAudioOptions) {
	const audioRef = useRef<HTMLAudioElement | null>(null)

	// Инициализация аудиоэлемента
	useEffect(() => {
		const audio = new Audio(options.src)
		audio.volume = options.volume ?? 1
		audio.loop = options.loop ?? false
		audioRef.current = audio

		if (options.autoplay) {
			audio.play().catch(e => console.error('Ошибка автовоспроизведения:', e))
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current = null
			}
		}
	}, [options.src, options.volume, options.loop, options.autoplay])

	const play = useCallback(() => {
		if (!audioRef.current) return
		audioRef.current.currentTime = 0
		audioRef.current.play().catch(e => console.error('Ошибка воспроизведения:', e))
	}, [])

	const pause = useCallback(() => {
		if (!audioRef.current) return
		audioRef.current.pause()
	}, [])

	const stop = useCallback(() => {
		if (!audioRef.current) return
		audioRef.current.pause()
		audioRef.current.currentTime = 0
	}, [])

	const setVolume = useCallback((volume: number) => {
		if (!audioRef.current) return
		audioRef.current.volume = Math.max(0, Math.min(1, volume))
	}, [])

	return {
		play,
		pause,
		stop,
		setVolume,
		audioRef
	}
}
