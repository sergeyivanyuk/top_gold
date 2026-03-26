'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PaymentFailedPage() {
	const router = useRouter()

	useEffect(() => {
		const timer = setTimeout(() => {
			router.push('/')
		}, 10000)
		return () => clearTimeout(timer)
	}, [router])

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div
				className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center"
				style={{
					background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
					borderRadius: '20px',
					outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
					outlineOffset: '-1px'
				}}
			>
				<h2 className="text-win-title mb-2 text-center text-red-400">Оплата не удалась</h2>
				<p className="text-gray-subtext text-center mb-6">
					К сожалению, произошла ошибка при обработке платежа. Пожалуйста, попробуйте еще раз или обратитесь в поддержку.
				</p>
				<div className="flex flex-col gap-4 w-full">
					<Link
						href="/payment"
						className="px-12 py-3 w-full text-center transition-colors btn-gold-slide"
					>
						Попробовать снова
					</Link>
					<Link
						style={{
							color: 'rgb(250, 158, 20)',
							fontSize: '18px',
							fontWeight: 500,
							textTransform: 'uppercase',
							lineHeight: '18px',
							letterSpacing: '0.18px',
							wordWrap: 'break-word',
							textShadow: '1px 1px 0px rgba(131, 29, 16, 0.50)',
							background:
								'linear-gradient(180deg, rgba(255, 236.90, 179.25, 0) 6%, rgba(254.37, 212.23, 101.72, 0) 30%, rgba(254, 198, 57, 0) 47%, rgba(249, 165, 5, 0) 55%, rgba(190, 103, 0, 0) 90%)',
							boxShadow: '0px -2px 4px rgba(255, 236.90, 179.25, 0.80)',
							borderRadius: '20px',
							outline: '2px rgb(250, 158, 20) solid',
							padding: '12px',
							width: '100%'
						}}
						className="flex-1 py-3 rounded-xl font-bold"
						href="/"
					>
						Вернуться на главную
					</Link>
				</div>
				<p className="text-gray-subtext text-sm mt-4">Вы будете автоматически перенаправлены на&nbsp;главную страницу через 10 секунд.</p>
			</div>
		</div>
	)
}
