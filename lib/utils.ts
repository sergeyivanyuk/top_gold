import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Возвращает стили для градиентного текста с тенью
 * @param gradient - CSS gradient string
 * @param shadowGradient - CSS gradient for shadow (optional)
 * @returns React CSS properties object
 */
export function getGradientTextStyles(gradient: string, shadowGradient?: string): React.CSSProperties {
	const baseStyle: React.CSSProperties = {
		backgroundImage: gradient,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 800,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.35px',
		whiteSpace: 'nowrap' as const
	}

	if (shadowGradient) {
		return {
			...baseStyle,
			backgroundImage: shadowGradient
		}
	}

	return baseStyle
}

/**
 * Форматирует число с разделителями тысяч
 * @param value - число или строка
 * @returns отформатированная строка
 */
export function formatNumber(value: number | string): string {
	const num = typeof value === 'string' ? parseFloat(value) : value
	if (isNaN(num)) return String(value)
	return new Intl.NumberFormat('ru-RU').format(num)
}
