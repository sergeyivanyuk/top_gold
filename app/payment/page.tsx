'use client'
import { Button } from '@/components/ui/Button'
import { PaymentMethod } from '@/types/payment'
import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function PaymentContent() {
	const [selectedPayment, setSelectedPayment] = useState('sbp')
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [showBonusModal, setShowBonusModal] = useState(false)
	const [showPromoModal, setShowPromoModal] = useState(false)
	const [showPrivacyModal, setShowPrivacyModal] = useState(false)
	const [showTermsModal, setShowTermsModal] = useState(false)
	const [nickname, setNickname] = useState('')
	const [promoCode, setPromoCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [paymentError, setPaymentError] = useState<string | null>(null)
	const searchParams = useSearchParams()
	const router = useRouter()
	const tariff = searchParams.get('tariff') || 'Стандарт'
	const price = searchParams.get('price') || '179'

	// Количество вращений и бонусных вращений в зависимости от тарифа
	const spinsByTariff: Record<string, number> = {
		Стандарт: 1,
		Выгодный: 3,
		Премиум: 5,
		Люкс: 8
	}
	const bonusSpinsByTariff: Record<string, number> = {
		Стандарт: 0,
		Выгодный: 1,
		Премиум: 2,
		Люкс: 3
	}
	const spins = spinsByTariff[tariff] || 1
	const bonusSpins = bonusSpinsByTariff[tariff] || 0

	const handleContinue = () => {
		if (!nickname.trim()) {
			alert('Введите ник')
			return
		}
		setShowSuccessModal(false)
		setShowConfirmModal(true)
	}

	const handleConfirm = () => {
		setShowConfirmModal(false)
		setShowBonusModal(true)
	}

	const handleEdit = () => {
		setShowConfirmModal(false)
		setShowSuccessModal(true)
	}

	const handleActivateBonus = () => {
		// Логика активации бонуса
		setShowBonusModal(false)
		router.push('/')
	}

	const handleSkipBonus = () => {
		// Пропустить бонус
		setShowBonusModal(false)
		router.push('/')
	}

	const handlePromoClick = () => {
		setShowPromoModal(true)
	}

	const handlePayment = async () => {
		setIsLoading(true)
		setPaymentError(null)
		try {
			const paymentMethod = selectedPayment as PaymentMethod
			const response = await fetch('/api/payment/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tariff,
					price: Number(price),
					paymentMethod,
					nickname,
					promoCode: promoCode || undefined
				})
			})
			const data = await response.json()
			if (!response.ok) {
				throw new Error(data.error || 'Ошибка при инициализации платежа')
			}
			// Всегда ожидаем ссылку на оплату
			if (data.paymentUrl) {
				window.location.href = data.paymentUrl
			} else {
				throw new Error('Не получена ссылка для оплаты')
			}
		} catch (error: any) {
			console.error('Payment error:', error)
			setPaymentError(error.message || 'Неизвестная ошибка')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className=" flex flex-col items-center justify-start p-4">
			{/* Заголовок страницы и кнопки назад и поддержка */}
			<div className="relative w-full text-center">
				<button
					className="absolute top-0 left-0 btn-nav"
					onClick={() => router.back()}
				>
					<ChevronLeft className="text-[#fff] font-bold w-8 h-8" />
				</button>
				<button className="absolute top-0 right-0 btn-nav">
					<Image
						src="/support.png"
						alt="Поддержка"
						width={20}
						height={20}
					/>
				</button>
				<h1 className="text-2xl font-bold mb-1 text-white">Оплата вращений</h1>
			</div>
			<p className="mb-10 text-gray-subtext">Вы выбрали {tariff.toLowerCase()}</p>
			{/* Что вы получите*/}
			<div className="w-full rounded-card overflow-hidden bg-[url('/banner.png')] bg-cover bg-center p-5 pb-10 mb-5">
				<h3 className="text-what-you-get mb-2.5">Что вы получите</h3>
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<span className="block w-2 h-2 rounded-full bg-bullet-gradient"></span>
						<span className="text-guaranteed-reward">Гарантированная награда</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="block w-2 h-2 rounded-full bg-bullet-gradient"></span>
						<span className="text-guaranteed-reward">Любое вращение выигрышное</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="block w-2 h-2 rounded-full bg-bullet-gradient"></span>
						<span className="text-guaranteed-reward">
							{spins + bonusSpins}{' '}
							{(() => {
								const total = spins + bonusSpins
								if (total % 10 === 1 && total % 100 !== 11) return 'вращение'
								if (total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 10 || total % 100 >= 20)) return 'вращения'
								return 'вращений'
							})()}{' '}
							рулетки
						</span>
					</div>
				</div>
			</div>
			{/* выбор способа оплаты */}
			<div className="flex flex-col items-center px-1.5 py-4 rounded-card w-full bg-radial-gold border-gold-light outline-offset-[-1px]">
				<span className="text-center mb-5 text-secondary-title">Выберите способ оплаты</span>
				{/* радио инпуты */}
				<div className="flex flex-col items-center w-full gap-2">
					<div
						className={`flex w-full items-center justify-between gap-2 py-5 px-5 rounded-4xl bg-radial-gold cursor-pointer ${selectedPayment === 'sbp' ? 'border-gold-active' : 'border-gold'}`}
						onClick={() => setSelectedPayment('sbp')}
					>
						<div className="flex items-center gap-1.5">
							<input
								type="radio"
								id="payment-method-1"
								name="payment-method"
								value="sbp"
								checked={selectedPayment === 'sbp'}
								onChange={() => setSelectedPayment('sbp')}
								className="radio-custom"
							/>
							<label
								htmlFor="payment-method-1"
								className="text-radio-label"
							>
								Оплатить через СБП
							</label>
						</div>
						<Image
							src="/sbp.png"
							alt="SBP"
							className="object-contain"
							width={51}
							height={30}
						/>
					</div>
					<div
						className={`flex w-full items-center justify-between gap-2 py-5 px-5 rounded-4xl bg-radial-gold cursor-pointer ${selectedPayment === 'card' ? 'border-gold-active' : 'border-gold'}`}
						onClick={() => setSelectedPayment('card')}
					>
						<div className="flex items-center gap-1.5">
							<input
								type="radio"
								id="payment-method-2"
								name="payment-method"
								value="card"
								checked={selectedPayment === 'card'}
								onChange={() => setSelectedPayment('card')}
								className="radio-custom"
							/>
							<label
								htmlFor="payment-method-2"
								className="text-radio-label"
							>
								Оплатить через банковскую карту
							</label>
						</div>
						<Image
							src="/card.png"
							alt="card"
							className="object-contain"
							width={23}
							height={22}
						/>
					</div>
				</div>
			</div>
			{/* Кнопка "Оплатить" */}
			<Button
				variant="gold"
				className="w-full mt-10"
				onClick={handlePayment}
				disabled={isLoading}
			>
				<span
					style={{
						fontSize: '36px',
						lineHeight: '44px'
					}}
				>
					{isLoading ? 'Обработка...' : `Оплатить ${price}₽`}
				</span>
			</Button>
			{paymentError && <div className="mt-4 text-red-400 text-center">Ошибка: {paymentError}</div>}

			<div className="mt-7.5 grid grid-cols-2 gap-2.5 w-full max-w-4xl">
				{/* Блок 1 */}
				<div className="flex flex-col items-center p-4 rounded-card bg-radial-gold border-gold-light outline-offset-[-1px]">
					<div className="relative w-12 h-12">
						<Image
							src="/official.png"
							alt="Официальное"
							width={48}
							height={48}
							className="object-contain"
						/>
					</div>
					<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
					<span className="text-center text-secondary-title">Официальное начисление</span>
				</div>

				{/* Блок 2 */}
				<div className="flex flex-col items-center justify-end  p-4 rounded-card bg-radial-gold border-gold-light outline-offset-[-1px]">
					<div className="relative w-12 h-12">
						<Image
							src="/lightning.png"
							alt="мгновенная активация"
							width={48}
							height={48}
							className="object-contain"
						/>
					</div>
					<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
					<span className="text-center text-secondary-title">Мгновенная активация</span>
				</div>
			</div>
			{/* Политика конфиденциальности, Пользовательское соглашение и промокод */}
			<div className="mt-3 text-white/50 text-[12px] flex flex-col items-center gap-1">
				<div className="flex items-center gap-0.5">
					{/* Пользовательское соглашение */}
					<button
						className="text-white/50 underline text-[10px] bg-transparent border-none p-0 cursor-pointer"
						onClick={() => setShowTermsModal(true)}
					>
						Пользовательское соглашение
					</button>{' '}
					| {/* Политика конфиденциальности */}
					<button
						className="text-white/50 underline text-[10px] bg-transparent border-none p-0 cursor-pointer"
						onClick={() => setShowPrivacyModal(true)}
					>
						Политика конфиденциальности
					</button>
				</div>
				{/* Промокод */}
				<button
					onClick={handlePromoClick}
					className="text-white/50 underline text-[10px] bg-transparent border-none p-0 cursor-pointer"
				>
					Ввести Промокод
				</button>
			</div>
			{/* Кнопка тестовой оплаты */}
			<button
				onClick={() => (window.location.href = '/payment/success?transaction=test')}
				className="mt-10 w-full max-w-4xl py-4 rounded-card bg-gradient-to-b from-green-500 to-green-700 text-white text-xl font-bold shadow-lg"
			>
				Тестовая оплата (перейти на главную)
			</button>

			{/* Модальное окно успеха (ввод ника) */}
			{showSuccessModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
					<div
						className="relative w-[90%] max-w-md rounded-2xl p-4 shadow-2xl flex flex-col items-center"
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
						<p className="text-gray-subtext text-center mb-6">
							Пожалуйста, введите свой ник в игре, чтобы мы могли зачислить вам выигрыш после вращения
						</p>
						{/* Инпут */}
						<input
							type="text"
							value={nickname}
							onChange={e => setNickname(e.target.value)}
							placeholder="Введите сюда ваш ник"
							className="w-full py-3 px-4 rounded-xl bg-black/30 border border-gold-light text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold mb-6"
						/>
						{/* Кнопка продолжить */}
						<button
							onClick={handleContinue}
							className="px-12 py-3 w-full transition-colors btn-gold-slide"
						>
							Продолжить
						</button>
					</div>
				</div>
			)}

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
							Вы указали никнейм <span style={{ color: '#F9A505' }}>{nickname}</span>. Именно на этот счет будет произведено зачисление. Убедитесь,
							что ник введен правильно.
						</p>
						{/* Две кнопки */}
						<div className="flex  flex-col gap-4 w-full">
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

			{/* Модальное окно с предложением бонусного вращения */}
			{showBonusModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
					<div
						className="relative w-[90%] max-w-md rounded-2xl p-6 px-2 shadow-2xl flex flex-col items-center"
						style={{
							background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
							borderRadius: '20px',
							outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
							outlineOffset: '-1px'
						}}
					>
						{/* Заголовок */}
						<h2 className="text-win-title mb-2 text-center">Вам почти повезло!</h2>
						{/* Подзаголовок */}
						<p className="text-gray-subtext text-center mb-6">
							Следующее вращение может все изменить!
							<br />
							Вам доступно бонусное вращение с повышенным шансом
						</p>
						{/* Две кнопки */}
						<div className="flex flex-col gap-4 w-full">
							<button
								onClick={handleActivateBonus}
								className="py-3 w-full rounded-xl btn-gold-slide font-bold text-xl"
							>
								Активировать бонус
							</button>
							<button
								onClick={handleSkipBonus}
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
								Без бонуса
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Модальное окно для ввода промокода */}
			{showPromoModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs"
					onClick={() => setShowPromoModal(false)}
				>
					<div
						className="relative w-[90%] max-w-md rounded-2xl p-5 shadow-2xl flex flex-col items-center"
						style={{
							background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
							borderRadius: '20px',
							outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
							outlineOffset: '-1px'
						}}
						onClick={e => e.stopPropagation()}
					>
						{/* Иконка gift.png */}
						<div className="relative w-24 h-24 mb-6">
							<Image
								src="/gift.png"
								alt="Промокод"
								fill
								className="object-contain"
							/>
						</div>
						{/* Разделительная линия */}
						<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
						{/* Заголовок */}
						<h2 className="text-win-title mb-2 text-center">Введите промокод</h2>
						{/* Подзаголовок */}
						<p className="text-gray-subtext text-center mb-6">Пожалуйста, введите промокод, чтобы мы могли зачислить вам выигрыш после вращения</p>
						{/* Инпут */}
						<input
							type="text"
							value={promoCode}
							onChange={e => setPromoCode(e.target.value)}
							placeholder="Введите сюда ваш промокод"
							className="w-full py-3 px-4 rounded-xl bg-black/30 border border-gold-light text-white text-[12px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold mb-6"
						/>
						{/* Кнопка продолжить */}
						<button
							onClick={() => setShowPromoModal(false)}
							disabled={!promoCode.trim()}
							className={`px-12 py-3 w-full transition-colors ${promoCode.trim() ? 'btn-gold-slide' : 'btn-gold-slide opacity-50 cursor-not-allowed'}`}
						>
							Продолжить
						</button>
					</div>
				</div>
			)}
			{/* Модальное окно политики конфиденциальности */}
			{showPrivacyModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs"
					onClick={() => setShowPrivacyModal(false)}
				>
					<div
						className="relative w-[90%] max-w-2xl max-h-[80vh] rounded-2xl p-6 shadow-2xl flex flex-col items-center"
						style={{
							background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
							borderRadius: '20px',
							outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
							outlineOffset: '-1px'
						}}
						onClick={e => e.stopPropagation()}
					>
						<h2 className="text-win-title mb-4 text-center">Политика конфиденциальности</h2>
						<div className="w-full h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
						<div
							className="w-full overflow-y-auto max-h-[60vh] text-white text-[10px] leading-relaxed px-2"
							style={{ whiteSpace: 'pre-line' }}
						>
							<p>1. Общие положения</p>
							<p>
								1.1. Настоящая Политика конфиденциальности (далее — «Политика») регулирует порядок обработки и защиты информации, которую Пользователь
								передаёт при использовании сервиса (далее — «Сервис»).{' '}
							</p>
							<p>
								1.2. Используя Сервис, Пользователь подтверждает своё согласие с условиями Политики. Если Пользователь не согласен с условиями — он
								обязан прекратить использование Сервиса.
							</p>
							<p>2. Сбор информации</p>
							<p>
								{' '}
								2.1. Сервис может собирать следующие типы данных: идентификаторы аккаунта (логин, ID, никнейм и т.п.); техническую информацию
								(IP-адрес, данные о браузере, устройстве и операционной системе); историю взаимодействий с Сервисом.
							</p>
							<p>
								2.2. Сервис не требует от Пользователя предоставления паспортных данных, документов, фотографий или другой личной информации, кроме
								минимально необходимой для работы.{' '}
							</p>
							<p>3. Использование информации </p>
							<p>
								3.1. Сервис может использовать полученную информацию исключительно для: обеспечения работы функционала; связи с Пользователем (в том
								числе для уведомлений и поддержки); анализа и улучшения работы Сервиса.
							</p>
							<p>4. Передача информации третьим лицам </p>
							<p>
								4.1. Администрация не передаёт полученные данные третьим лицам, за исключением случаев: если это требуется по закону; если это
								необходимо для исполнения обязательств перед Пользователем (например, при работе с платёжными системами); если Пользователь сам дал на
								это согласие.
							</p>
							<p>5. Хранение и защита данных</p>
							<p>5.1. Данные хранятся в течение срока, необходимого для достижения целей обработки.</p>
							<p>
								5.2. Администрация принимает разумные меры для защиты данных, но не гарантирует абсолютную безопасность информации при передаче через
								интернет.
							</p>
							<p>6. Отказ от ответственности</p>
							<p>6.1. Пользователь понимает и соглашается, что передача информации через интернет всегда сопряжена с рисками.</p>
							<p>
								{' '}
								6.2. Администрация не несёт ответственности за утрату, кражу или раскрытие данных, если это произошло по вине третьих лиц или самого
								Пользователя.
							</p>
							<p>7. Изменения в Политике</p>
							<p>7.1. Администрация вправе изменять условия Политики без предварительного уведомления.</p>
							<p>7.2.Продолжение использования Сервиса после внесения изменений означает согласие Пользователя с новой редакцией Политики.</p>
						</div>
						<button
							onClick={() => setShowPrivacyModal(false)}
							className="mt-6 px-12 py-3 w-full transition-colors btn-gold-slide"
						>
							Закрыть
						</button>
					</div>
				</div>
			)}
			{/* Модальное окно пользовательского соглашения */}
			{showTermsModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs"
					onClick={() => setShowTermsModal(false)}
				>
					<div
						className="relative w-[90%] max-w-2xl max-h-[80vh] rounded-2xl p-6 shadow-2xl flex flex-col items-center"
						style={{
							background: 'radial-gradient(ellipse 100.00% 100.00% at 49.68% -0.00%, #AA7A2D 0%, #643C1C 25%, #121413 73%)',
							borderRadius: '20px',
							outline: '1px rgba(255, 233.54, 111.93, 0.80) solid',
							outlineOffset: '-1px'
						}}
						onClick={e => e.stopPropagation()}
					>
						<h2 className="text-win-title mb-4 text-center">Пользовательское соглашение</h2>
						<div className="w-full h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
						<div
							className="w-full overflow-y-auto max-h-[60vh] text-white text-[10px] leading-relaxed px-2"
							style={{ whiteSpace: 'pre-line' }}
						>
							<p>1. Общие положения</p>
							<p>
								1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между Пользователем и Администрацией Сервиса
								(далее — «Сервис»).{' '}
							</p>
							<p>1.2. Используя Сервис, Пользователь подтверждает, что он прочитал, понял и полностью согласен со всеми условиями Соглашения.</p>
							<p>1.3. Если Пользователь не согласен с каким‑либо условием Соглашения, он обязан немедленно прекратить использование Сервиса.</p>
							<p>2. Права и обязанности Пользователя</p>
							<p>2.1. Пользователь обязуется:</p>
							<ul>
								<li>использовать Сервис только в законных целях; </li>
								<li>не предпринимать действий, которые могут нарушить работу Сервиса или причинить вред другим пользователям;</li>
								<li>не передавать свои учётные данные третьим лицам.</li>
							</ul>
							<p>2.2. Пользователь имеет право:</p>
							<ul>
								<li>использовать функционал Сервиса в соответствии с его назначением;</li>
								<li>обращаться в поддержку по вопросам, связанным с работой Сервиса.</li>
							</ul>
							<p>3. Права и обязанности Администрации</p>
							<p>3.1. Администрация обязуется:</p>
							<ul>
								<li>обеспечивать работоспособность Сервиса в пределах технических возможностей;</li>
								<li>обрабатывать обращения Пользователя в поддержку.</li>
							</ul>
							<p>3.2. Администрация имеет право:</p>
							<ul>
								<li>в одностороннем порядке изменять условия Соглашения, уведомляя Пользователя путём публикации новой версии на сайте Сервиса;</li>
								<li>приостанавливать или прекращать работу Сервиса в случае технических неполадок или нарушений со стороны Пользователя.</li>
							</ul>
							<p>4. Ограничение ответственности</p>
							<p>
								4.1. Сервис предоставляется «как есть». Администрация не гарантирует бесперебойную работу Сервиса и не несёт ответственности за любые
								прямые или косвенные убытки, возникшие в результате его использования.
							</p>
							<p>4.2. Администрация не отвечает за действия третьих лиц, которые могут повлиять на работу Сервиса.</p>
							<p>5. Заключительные положения</p>
							<p>5.1. Соглашение вступает в силу с момента начала использования Сервиса и действует до его прекращения.</p>
							<p>5.2. Все споры, возникающие из Соглашения, подлежат разрешению в соответствии с законодательством Российской Федерации.</p>
						</div>
						<button
							onClick={() => setShowTermsModal(false)}
							className="mt-6 px-12 py-3 w-full transition-colors btn-gold-slide"
						>
							Закрыть
						</button>
					</div>
				</div>
			)}
		</main>
	)
}

export default function PaymentPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
			<PaymentContent />
		</Suspense>
	)
}
