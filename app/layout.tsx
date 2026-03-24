import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: '#0a0a0a'
}

export const metadata: Metadata = {
	title: 'Gold Roulette',
	description: 'Крути рулетку и выигрывай золото!',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'Gold Roulette'
	},
	manifest: '/manifest.json'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru">
			<body className="min-h-screen bg-background text-foreground antialiased touch-manipulation">{children}</body>
		</html>
	)
}
