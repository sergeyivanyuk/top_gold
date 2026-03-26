'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NavButtonProps {
	direction: 'prev' | 'next'
	onClick: () => void
	className?: string
	ariaLabel?: string
}

export function NavButton({ direction, onClick, className = '', ariaLabel }: NavButtonProps) {
	const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
	const defaultAriaLabel = direction === 'prev' ? 'Предыдущий слайд' : 'Следующий слайд'

	return (
		<button
			onClick={onClick}
			className={`btn-nav ${className}`}
			aria-label={ariaLabel || defaultAriaLabel}
		>
			<Icon className="text-[#fff] font-bold w-8 h-8" />
		</button>
	)
}
