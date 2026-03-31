import { useCallback, useRef } from 'react'

// Глобальный синглтон аудиоэлемента для звука кнопки
let globalAudio: HTMLAudioElement | null = null

function getButtonAudio() {
	if (!globalAudio) {
		globalAudio = new Audio('/button1.mp3')
		globalAudio.volume = 0.4
		globalAudio.preload = 'auto'
	}
	return globalAudio
}

/**
 * Глобальный хук для воспроизведения звука нажатия кнопки
 * Использует синглтон аудиоэлемент для избежания конфликтов
 * @returns Функция playButtonSound для воспроизведения звука
 */
export function useButtonSound() {
	const playButtonSound = useCallback(() => {
		const audio = getButtonAudio()
		try {
			// Сбрасываем время воспроизведения для повторного проигрывания
			audio.currentTime = 0
			audio.play().catch(error => {
				// Игнорируем ошибки, связанные с прерыванием воспроизведения
				if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
					console.error('Ошибка воспроизведения звука кнопки:', error)
				}
			})
		} catch (error) {
			console.error('Ошибка при работе со звуком кнопки:', error)
		}
	}, [])

	return { playButtonSound }
}

/**
 * Упрощенная версия - возвращает только функцию playButtonSound
 * для использования в компонентах
 */
export function useButtonSoundSimple() {
	const { playButtonSound } = useButtonSound()
	return playButtonSound
}
