'use client'

import { ROULETTE_NUMBER_GRADIENT, ROULETTE_SHADOW_GRADIENT } from '@/lib/constants'

interface GradientNumberProps {
	value: number | string
	size?: 'sm' | 'md' | 'lg' | 'xl'
	className?: string
	shadowClassName?: string
}

export function GradientNumber({ value, size = 'md', className = '', shadowClassName = '' }: GradientNumberProps) {
	const sizeStyles = {
		sm: 'text-[24px]',
		md: 'text-[35px]',
		lg: 'text-[50px]',
		xl: 'text-[80px]'
	}

	const lineHeight = {
		sm: '24px',
		md: '35px',
		lg: '50px',
		xl: '80px'
	}

	const baseStyle = {
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 800,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.35px',
		whiteSpace: 'nowrap' as const
	}

	return (
		<div className={`relative inline-block h-[${lineHeight[size]}] ${className}`}>
			{/* Тень */}
			<span
				className={`absolute top-0 left-0 translate-x-[1px] translate-y-[1px] ${sizeStyles[size]} ${shadowClassName}`}
				style={{
					...baseStyle,
					backgroundImage: ROULETTE_SHADOW_GRADIENT,
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text',
					color: 'transparent',
					lineHeight: lineHeight[size]
				}}
			>
				{value}
			</span>
			{/* Основной текст */}
			<span
				className={`relative ${sizeStyles[size]}`}
				style={{
					...baseStyle,
					backgroundImage: ROULETTE_NUMBER_GRADIENT,
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundClip: 'text',
					color: 'transparent',
					lineHeight: lineHeight[size]
				}}
			>
				{value}
			</span>
		</div>
	)
}
