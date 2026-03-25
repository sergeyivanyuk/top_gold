import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface TitleProps {
	children: ReactNode
	className?: string
	variant?: 'gold' | 'default'
}

// Основной золотой заголовок
const GOLD_TITLE_STYLES = {
	color: '#FFEDB3',
	fontSize: '35px',
	fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
	fontWeight: '700',
	textTransform: 'uppercase' as const,
	lineHeight: '35px',
	letterSpacing: '0.35px',
	textShadow: '1px 2px 0px rgba(131, 29, 16, 0.50)'
}

// Второстепенный текст
const SECONDARY_TEXT_STYLES = {
	color: '#FFF4EB',
	fontSize: '20px',
	fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
	fontWeight: '700',
	textTransform: 'uppercase' as const,
	lineHeight: '20px',
	letterSpacing: '0.20px',
	textShadow: '1px 1px 0px rgba(37, 37, 37, 0.50)'
}

// Белый заголовок (для модальных окон)
const WHITE_TITLE_STYLES = {
	color: 'white',
	fontSize: '32px',
	fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
	fontWeight: '700',
	textTransform: 'uppercase' as const,
	lineHeight: '32px',
	letterSpacing: '0.32px',
	textShadow: '1px 1px 0px rgba(37, 37, 37, 0.50)'
}

// Серый подтекст
const GRAY_SUBTEXT_STYLES = {
	color: '#D9D9D9',
	fontSize: '16px',
	fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
	fontWeight: '400',
	lineHeight: '16px',
	letterSpacing: '0.16px'
}

export function Title({ children, className, variant = 'gold' }: TitleProps) {
	if (variant === 'gold') {
		return (
			<span
				className={cn('inline-block', className)}
				style={GOLD_TITLE_STYLES}
			>
				{children}
			</span>
		)
	}

	return <span className={cn('text-xl font-bold', className)}>{children}</span>
}

// Второстепенный текст (меньше, светлее)
interface SecondaryTextProps {
	children: ReactNode
	className?: string
}

export function SecondaryText({ children, className }: SecondaryTextProps) {
	return (
		<span
			className={cn('inline-block', className)}
			style={SECONDARY_TEXT_STYLES}
		>
			{children}
		</span>
	)
}

// Белый заголовок (для модальных окон)
interface WhiteTitleProps {
	children: ReactNode
	className?: string
}

export function WhiteTitle({ children, className }: WhiteTitleProps) {
	return (
		<span
			className={cn('inline-block', className)}
			style={WHITE_TITLE_STYLES}
		>
			{children}
		</span>
	)
}

// Серый подтекст (для модальных окон)
interface GraySubtextProps {
	children: ReactNode
	className?: string
}

export function GraySubtext({ children, className }: GraySubtextProps) {
	return (
		<span
			className={cn('inline-block', className)}
			style={GRAY_SUBTEXT_STYLES}
		>
			{children}
		</span>
	)
}
