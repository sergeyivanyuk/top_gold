'use client'

import { recordPurchase, recordUser } from '@/lib/dailyStats'
import { getSpinsByTariff, usePurchasesStore } from '@/lib/store/purchases'
import { useRouletteStore } from '@/lib/store/roulette'
import { useUserStore } from '@/lib/store/user'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function PaymentSuccessContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const transactionId = searchParams.get('transaction')
	const tariff = searchParams.get('tariff') || 'Премиум' // По умолчанию для тестирования
	const priceParam = searchParams.get('price')
	const price = priceParam ? parseFloat(priceParam) : 0
	const [nickname, setNickname] = useState('')
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const addPurchase = usePurchasesStore(state => state.addPurchase)
	const getTotalSpins = usePurchasesStore(state => state.getTotalSpins)
	const setNicknameInStore = useUserStore(state => state.setNickname)
	const setRemainingSpins = useRouletteStore(state => state.setRemainingSpins)

	const handleContinue = () => {
		if (!nickname.trim()) {
			alert('Введите ник')
			return
		}
		setShowConfirmModal(true)
	}

	const handleConfirm = () => {
		const trimmedNickname = nickname.trim()
		// Сохраняем ник в user store
		setNicknameInStore(trimmedNickname)

		// Добавляем покупку в store
		const spins = getSpinsByTariff(tariff)
		addPurchase({
			nickname: trimmedNickname,
			tariff,
			spins,
			transactionId: transactionId || undefined
		})

		// Регистрируем покупку и пользователя в дневной статистике
		if (price > 0) {
			recordPurchase(price)
		}
		recordUser(trimmedNickname)

		// Обновляем количество оставшихся вращений
		const totalSpins = getTotalSpins(trimmedNickname)
		setRemainingSpins(totalSpins)

		// Перенаправляем на главную страницу
		router.push('/')
	}

	const handleEdit = () => {
		setShowConfirmModal(false)
	}

	return (
		<div className="min-h-screen flex items-center justify-center  p-4">
			{/* Модальное окно успеха */}
			<div
				className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center"
				style={{
					background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
					borderRadius: '20px',
					outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
					outlineOffset: '-1px'
				}}
			>
				{/* Иконка */}
				<div className="relative w-24 h-24 mb-6">
					<Image
						src="/sussess.png"
						alt="Успех"
						fill
						className="object-contain"
					/>
				</div>
				{/* Заголовок */}
				<h2 className="text-win-title mb-2 text-center">Оплата выполнена</h2>
				{/* Подзаголовок */}
				<p className="text-gray-subtext text-center mb-6">Пожалуйста, введите свой ник в игре, чтобы мы могли зачислить вам выигрыш после вращений</p>
				{/* Инпут */}
				<input
					type="text"
					value={nickname}
					onChange={e => setNickname(e.target.value)}
					placeholder="Введите сюда ваш ник"
					className="w-full py-3 px-4 rounded-xl bg-black/30 border border-gold-light text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold mb-6"
				/>
				{/* номер заказа */}
				<p className="text-gray-subtext text-center mb-6">Ваш номер заказа {transactionId || 'неизвестен'}</p>
				{/* Кнопка продолжить */}
				<button
					onClick={handleContinue}
					className="px-12 py-3 w-full transition-colors btn-gold-slide"
				>
					Продолжить
				</button>
			</div>

			{/* Модальное окно подтверждения ника */}
			{showConfirmModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
					<div
						className="relative w-[90%] max-w-md rounded-2xl p-6 shadow-2xl flex flex-col items-center"
						style={{
							background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
							borderRadius: '20px',
							outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
							outlineOffset: '-1px'
						}}
					>
						{/* Заголовок */}
						<h2 className="text-win-title mb-2 text-center">Все верно?</h2>
						{/* Подзаголовок */}
						<p className="text-gray-subtext text-center mb-6">
							Вы указали никнейм <span style={{ color: '#F9A505' }}>{nickname}</span>. Именно на этот аккаунт будет произведено зачисление. Убедитесь,
							что ник введен правильно.
						</p>
						{/* Две кнопки */}
						<div className="flex flex-col gap-4 w-full">
							<button
								onClick={handleConfirm}
								className="flex-1 py-3 rounded-xl btn-gold-slide font-bold"
							>
								Подтвердить
							</button>
							<button
								onClick={handleEdit}
								style={{
									color: 'rgb(250, 158, 20)',
									fontSize: '24px',
									fontWeight: 500,
									textTransform: 'uppercase',
									lineHeight: '24px',
									letterSpacing: '0.24px',
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
							>
								Изменить
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default function PaymentSuccessPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
			<PaymentSuccessContent />
		</Suspense>
	)
}
