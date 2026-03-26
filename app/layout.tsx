import type { Metadata, Viewport } from 'next'
import { Roboto_Condensed } from 'next/font/google'
import './globals.css'
import Image from 'next/image'

const robotoCondensed = Roboto_Condensed({
	weight: ['400', '700', '900'],
	subsets: ['cyrillic', 'latin'],
	variable: '--font-roboto-condensed'
})

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: '#0a0a0a'
}

export const metadata: Metadata = {
	title: 'TopGold',
	description: 'Крути рулетку и выигрывай золото!',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'TopGold'
	},
	manifest: '/manifest.json'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru">
			<body className={`${robotoCondensed.variable} min-h-screen bg-background text-foreground antialiased touch-manipulation`}>
				{/* Хедер */}
				<header className="p-4 safe-area-top">
					<div className="flex items-center justify-center">
						<div className="relative w-screen h-[40px]">
							<Image
								src="/logo.png"
								alt="Logo"
								fill
								className="object-contain w-screen h-full"
							/>
						</div>
					</div>
				</header>
				{children}
			</body>
		</html>
	)
}
