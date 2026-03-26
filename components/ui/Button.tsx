'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'gold-outline'
	size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Стили для gold кнопки (основная кнопка рулетки)
const GOLD_BUTTON_STYLES = {
	background: 'linear-gradient(180deg, #FFEDB3 6%, #FED466 30%, #FEC639 47%, #F9A505 55%, #BE6700 90%)',
	boxShadow: '0px 0px 20px #FD7906 inset, 0px -2px 4px rgba(255, 236.90, 179.25, 0.80)',
	borderRadius: '20px',
	outline: '2px rgba(255, 233.54, 111.93, 0.90) solid',
	outlineOffset: '-2px'
}

const GOLD_TEXT_STYLES = {
	color: '#472004',
	fontSize: '19px',
	fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
	fontWeight: '900',
	textTransform: 'uppercase' as const,
	lineHeight: '32px',
	letterSpacing: '0.19px',
	textShadow: '1px 1px 0px rgba(131, 29, 16, 0.50)'
}

// Стили для second gold кнопки (второстепенная)
const GOLD_OUTLINE_TEXT_STYLES = {
	color: 'rgba(255, 233.54, 111.93, 0.90)',
	fontSize: '24px',
	fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
	fontWeight: '500',
	textTransform: 'uppercase' as const,
	lineHeight: '24px',
	letterSpacing: '0.24px',
	textShadow: '1px 1px 0px rgba(131, 29, 16, 0.50)'
}

const GOLD_OUTLINE_BUTTON_STYLES = {
	background:
		'linear-gradient(180deg, rgba(255, 236.90, 179.25, 0) 6%, rgba(254.37, 212.23, 101.72, 0) 30%, rgba(254, 198, 57, 0) 47%, rgba(249, 165, 5, 0) 55%, rgba(190, 103, 0, 0) 90%)',
	boxShadow: '0px 0px 20px #FD7906 inset, 0px -2px 4px rgba(255, 236.90, 179.25, 0.80)',
	borderRadius: '20px',
	outline: '2px rgba(255, 233.54, 111.93, 0.90) solid',
	outlineOffset: '-2px',
	width: '350px',
	height: '52px',
	paddingLeft: '40px',
	paddingRight: '40px',
	paddingTop: '10px',
	paddingBottom: '10px'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant = 'primary', size = 'md', children, type = 'button', ...props }, ref) => {
		return (
			<button
				ref={ref}
				type={type}
				className={cn(
					'inline-flex items-center justify-center font-bold rounded-3xl uppercase transition-colors tracking-wide',
					'disabled:opacity-50 disabled:cursor-not-allowed',
					{
						// Gold - основная кнопка рулетки
						'': variant === 'gold',
						'bg-gray-700 text-white hover:bg-gray-600': variant === 'secondary',
						'border-2 border-[#ffcf7c] text-[#ffcf7c] hover:bg-[#ffcf7c]/10': variant === 'outline',
						'text-gray-400 hover:text-white hover:bg-gray-800': variant === 'ghost'
					},
					{
						'px-3 py-1.5 text-sm': size === 'sm',
						'px-4 py-1.5': size === 'md',
						'px-6 py-1.5 text-lg': size === 'lg',
						'px-10 py-2.5 text-xl': size === 'xl'
					},
					className
				)}
				style={
					variant === 'gold'
						? {
								...GOLD_BUTTON_STYLES,
								paddingLeft: '40px',
								paddingRight: '40px',
								paddingTop: '10px',
								paddingBottom: '10px'
							}
						: variant === 'gold-outline'
							? GOLD_OUTLINE_BUTTON_STYLES
							: undefined
				}
				{...props}
			>
				{variant === 'gold' ? (
					<span style={GOLD_TEXT_STYLES}>{children}</span>
				) : variant === 'gold-outline' ? (
					<span style={GOLD_OUTLINE_TEXT_STYLES}>{children}</span>
				) : (
					children
				)}
			</button>
		)
	}
)

Button.displayName = 'Button'

export { Button }
