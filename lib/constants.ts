// Общие градиенты и цвета для проекта

// Радиальный градиент для карточек (используется в статистике, преимуществах, слайдах)
export const RADIAL_GRADIENT = 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)'

// Градиент для золотых кнопок
export const GOLD_BUTTON_GRADIENT = 'linear-gradient(180deg, #FFEDB3 6%, #FED466 30%, #FEC639 47%, #F9A505 55%, #BE6700 90%)'

// Градиент для золотого текста
export const GOLD_TEXT_GRADIENT = 'linear-gradient(to bottom, #FFEDB3 6%, #FED466 30%, #FEC639 47%, #F9A505 55%, #BE6700 90%)'

// Градиент для текста цифр рулетки (многоцветный)
export const ROULETTE_NUMBER_GRADIENT = 'linear-gradient(to bottom, #FFEDB3 6%, #FED466 30%, #FEC639 47%, #F9A505 55%, #BE6700 90%)'

// Градиент для тени текста цифр рулетки (верх #F3DFA2, низ #C57F34)
export const ROULETTE_SHADOW_GRADIENT = 'linear-gradient(to bottom, #F3DFA2 0%, #C57F34 100%)'

// Цвета текста
export const COLORS = {
	gold: '#FFEDB3',
	goldDark: '#BE6700',
	white: '#FFFFFF',
	lightGray: '#D9D9D9',
	cream: '#FFF4EB',
	orange: '#FD7906'
}

// Стили текста (для использования в inline или как классы Tailwind)
export const TEXT_STYLES = {
	// Основной золотой заголовок (35px, жирный, тень)
	goldTitle: {
		color: COLORS.gold,
		fontSize: '35px',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		lineHeight: '35px',
		letterSpacing: '0.35px',
		textShadow: '1px 2px 0px rgba(131, 29, 16, 0.50)'
	},
	// Второстепенный текст (20px, жирный, тень)
	secondaryTitle: {
		color: COLORS.cream,
		fontSize: '20px',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		lineHeight: '20px',
		letterSpacing: '0.20px',
		textShadow: '1px 1px 0px rgba(37, 37, 37, 0.50)'
	},
	// Белый заголовок (32px, жирный, тень)
	whiteTitle: {
		color: COLORS.white,
		fontSize: '32px',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		lineHeight: '32px',
		letterSpacing: '0.32px',
		textShadow: '1px 1px 0px rgba(37, 37, 37, 0.50)'
	},
	// Серый подтекст (16px, обычный)
	graySubtext: {
		color: COLORS.lightGray,
		fontSize: '16px',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 400,
		lineHeight: '16px',
		letterSpacing: '0.16px'
	},
	// Большой золотой текст (80px, жирный, тень)
	bigGold: {
		color: COLORS.gold,
		fontSize: '80px',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		lineHeight: '80px',
		letterSpacing: '0.80px',
		textShadow: '1px 2px 0px rgba(131, 29, 16, 0.50)'
	},
	// Текст кнопки золотой (19px, черный, жирный)
	goldButtonText: {
		color: '#472004',
		fontSize: '19px',
		fontFamily: 'var(--font-roboto-condensed), Roboto Condensed, sans-serif',
		fontWeight: 900,
		textTransform: 'uppercase' as const,
		lineHeight: '32px',
		letterSpacing: '0.19px',
		textShadow: '1px 1px 0px rgba(131, 29, 16, 0.50)'
	}
}

// Границы
export const BORDERS = {
	gold: '2px rgba(255, 233.54, 111.93, 0.90) solid',
	goldLight: '1px rgba(255, 233.54, 111.93, 0.80) solid',
	white: '2px white solid'
}

// Тени
export const SHADOWS = {
	goldButton: '0px 0px 20px #FD7906 inset, 0px -2px 4px rgba(255, 236.90, 179.25, 0.80)',
	card: '0.8333333134651184px 0.8333333134651184px 0px rgba(37.47, 37.47, 37.47, 0.50), 0px -0.8333333134651184px 3.3333332538604736px rgba(255, 255, 255, 0.25)'
}

// Размеры
export const SIZES = {
	button: {
		paddingX: '40px',
		paddingY: '10px',
		borderRadius: '20px'
	},
	card: {
		borderRadius: '20px',
		outlineOffset: '-1px'
	}
}
