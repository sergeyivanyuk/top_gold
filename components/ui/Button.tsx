'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
	size?: 'sm' | 'md' | 'lg'
}

// Единые стили для всех кнопок приложения
const BUTTON_GRADIENT = 'linear-gradient(to bottom, #ffcf7c, #cf6c02)'
const BUTTON_TEXT_COLOR = '#331804'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
	return (
		<button
			ref={ref}
			className={cn(
				'inline-flex items-center justify-center font-bold rounded-3xl uppercase transition-colors  tracking-wide',
				'disabled:opacity-50 disabled:cursor-not-allowed',
				{
					'text-[#331804]': variant === 'primary',
					'bg-gray-700 text-white hover:bg-gray-600': variant === 'secondary',
					'border-2 border-[#ffcf7c] text-[#ffcf7c] hover:bg-[#ffcf7c]/10': variant === 'outline',
					'text-gray-400 hover:text-white hover:bg-gray-800': variant === 'ghost'
				},
				{
					'px-3 py-1.5 text-sm': size === 'sm',
					'px-4 py-1.5': size === 'md',
					'px-6 py-1.5 text-lg': size === 'lg'
				},
				className
			)}
			style={
				variant === 'primary'
					? {
							background: BUTTON_GRADIENT,
							boxShadow: '0 -2px 4px 2px rgba(172, 159, 121, 0.5), 0 2px 4px 2px rgba(172, 159, 121, 0.3)'
						}
					: undefined
			}
			{...props}
		>
			{children}
		</button>
	)
})

Button.displayName = 'Button'

export { Button }
