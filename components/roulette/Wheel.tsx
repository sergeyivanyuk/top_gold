import { ROULETTE_SEGMENTS, SEGMENT_BORDER } from '@/config/roulette'
import { ROULETTE_NUMBER_GRADIENT, ROULETTE_SHADOW_GRADIENT } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface WheelProps {
	rotation: number
	isSpinning: boolean
	segmentAngle: number
}
export function Wheel({ rotation, isSpinning, segmentAngle }: WheelProps) {
	return (
		<div className="relative">
			{/* Указатель */}
			<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
				<div className="relative w-10 h-12">
					<Image
						src="/arrow-top.png"
						alt="Указатель рулетки"
						fill
						sizes="40px"
						className="object-contain drop-shadow-lg"
					/>
				</div>
			</div>

			{/* Декоративные стрелки по окружности */}
			{/* Слева */}
			<div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
				<div className="relative w-7 h-9">
					<Image
						src="/arrow-left.png"
						alt="Стрелка слева"
						fill
						sizes="40px"
						className="object-contain drop-shadow-lg"
					/>
				</div>
			</div>
			{/* Справа */}
			<div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
				<div className="relative w-7 h-9">
					<Image
						src="/arrow-left.png"
						alt="Стрелка справа"
						fill
						sizes="40px"
						className="object-contain drop-shadow-lg rotate-180"
					/>
				</div>
			</div>
			{/* Снизу */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
				<div className="relative w-7 h-9">
					<Image
						src="/arrow-left.png"
						alt="Стрелка снизу"
						fill
						sizes="28px"
						className="object-contain drop-shadow-lg -rotate-90"
					/>
				</div>
			</div>
			{/* Колесо */}
			<div
				className="relative w-72 h-72 md:w-80 md:h-80 rounded-full shadow-2xl overflow-hidden"
				style={{ transform: `rotate(${rotation}deg)`, border: '1px solid #FFEDB3' }}
			>
				<div className={cn('absolute inset-0', !isSpinning && 'animate-sway')}>
					{/* Базовый фон - conic-gradient с линейными градиентами внутри сегментов */}
					<div
						className="absolute inset-0"
						style={{
							background: (() => {
								// Данные о градиентах из COLORS
								const gradientStops = {
									gold: [
										{ color: '#FFB81F', pos: 9 },
										{ color: '#A25A1E', pos: 38 },
										{ color: '#935C14', pos: 55 },
										{ color: '#5D3E15', pos: 90 }
									],
									black: [
										{ color: '#493C2C', pos: 9 },
										{ color: '#5E411D', pos: 33 },
										{ color: '#401F0B', pos: 55 },
										{ color: '#140501', pos: 90 }
									],
									blue: [
										{ color: '#124472', pos: 9 },
										{ color: '#1E3469', pos: 33 },
										{ color: '#2B1C61', pos: 55 },
										{ color: '#1D003E', pos: 90 }
									],
									red: [
										{ color: '#C35B15', pos: 9 },
										{ color: '#D34415', pos: 33 },
										{ color: '#C42A03', pos: 55 },
										{ color: '#830000', pos: 90 }
									]
								} as const

								// Собираем все остановки для conic-gradient
								const stops: string[] = []
								ROULETTE_SEGMENTS.forEach((segment, segmentIndex) => {
									const segmentStart = segmentIndex * segmentAngle
									const segmentEnd = (segmentIndex + 1) * segmentAngle
									const segmentLength = segmentAngle
									const stopsData = gradientStops[segment.color as keyof typeof gradientStops] || gradientStops.black

									// Добавляем первую остановку в начале сегмента
									stops.push(`${stopsData[0].color} ${segmentStart}deg`)

									// Добавляем промежуточные остановки
									stopsData.forEach(stop => {
										const angle = segmentStart + (stop.pos / 100) * segmentLength
										stops.push(`${stop.color} ${angle}deg`)
									})

									// Добавляем последнюю остановку в конце сегмента (последний цвет)
									stops.push(`${stopsData[stopsData.length - 1].color} ${segmentEnd}deg`)
								})

								// Убираем дубликаты подряд (если есть) и формируем строку
								const uniqueStops = stops.filter((stop, idx, arr) => idx === 0 || stop !== arr[idx - 1])
								return `conic-gradient(${uniqueStops.join(', ')})`
							})()
						}}
					/>

					{/* Линейный градиент поверх конического для объёма */}
					<div
						className="absolute inset-0"
						style={{
							background: 'linear-gradient(0deg, #C1C1C1 9%, #A0A0A0 33%, #404040 55%, #0E0E0E 90%)',
							mixBlendMode: 'overlay',
							opacity: 0.1
						}}
					/>

					{/* Оверлей текстуры для винтажного вида */}
					<div
						className="absolute inset-0"
						style={{
							backgroundImage: "url('/segment-overlay.png')",
							backgroundSize: 'cover',
							backgroundRepeat: 'no-repeat',
							backgroundPosition: 'center',
							mixBlendMode: 'overlay',
							opacity: 0.6
						}}
					/>

					{/* Светящиеся точки для красного и золотого сегментов */}
					<div className="absolute inset-0 pointer-events-none">
						{ROULETTE_SEGMENTS.map((segment, index) => {
							if (segment.color !== 'red' && segment.color !== 'gold') return null

							const angle = index * segmentAngle + segmentAngle / 2
							const rad = (angle - 90) * (Math.PI / 180)
							// Точки near the top edge
							const positions = [
								{ x: 50 + 42 * Math.cos(rad - 0.15), y: 50 + 42 * Math.sin(rad - 0.15), size: 10, blur: 6 },
								{ x: 50 + 42 * Math.cos(rad), y: 50 + 42 * Math.sin(rad), size: 8, blur: 1 },
								{ x: 50 + 45 * Math.cos(rad - 0.25), y: 50 + 45 * Math.sin(rad - 0.25), size: 6, blur: 0.5 },
								{ x: 50 + 45 * Math.cos(rad + 0.25), y: 50 + 45 * Math.sin(rad + 0.25), size: 6, blur: 0.5 }
							].map(p => ({
								...p,
								x: Number(p.x.toFixed(2)),
								y: Number(p.y.toFixed(2))
							}))

							return positions.map((pos, i) => (
								<div
									key={`dot-${index}-${i}`}
									className="absolute rounded-full"
									style={{
										left: `${pos.x}%`,
										top: `${pos.y}%`,
										width: `${pos.size}px`,
										height: `${pos.size}px`,
										transform: 'translate(-50%, -50%)',
										background: 'linear-gradient(180deg, #FFEDB3 0%, #FFDF79 18%, #BE6700 90%)',
										filter: `blur(${pos.blur}px)`
									}}
								/>
							))
						})}
					</div>

					{/* Border ободок */}
					<div
						className="absolute inset-0 rounded-full pointer-events-none"
						style={{
							border: SEGMENT_BORDER
						}}
					/>

					{/* Разделительные линии с градиентом */}
					{ROULETTE_SEGMENTS.map((_, index) => {
						const angle = index * segmentAngle
						return (
							<div
								key={`divider-${index}`}
								className="absolute inset-0 pointer-events-none"
								style={{
									transform: `rotate(${angle}deg)`,
									transformOrigin: 'center'
								}}
							>
								<div
									className="absolute left-1/2 top-0 w-1 h-1/2"
									style={{
										background: 'linear-gradient(to bottom, #fbbf24, #d97706, #fbbf24)',
										transform: 'translateX(-50%)',
										borderRadius: '1px'
									}}
								/>
							</div>
						)
					})}

					{/* Текст и иконки на сегментах */}
					{ROULETTE_SEGMENTS.map((segment, index) => (
						<div
							key={segment.id}
							className="absolute inset-0 flex flex-col items-center justify-start pt-3"
							style={{
								transform: `rotate(${index * segmentAngle + segmentAngle / 2}deg)`
							}}
						>
							<div className="absolute w-5 h-5 bottom-17">
								<Image
									src="/gold-one.png"
									alt="голда"
									fill
									sizes="20px"
									className="object-contain drop-shadow-lg"
									style={{ filter: 'brightness(1.2)' }}
								/>
							</div>
							{/* Бордер сегментов с оверлеем */}
							<div className="absolute top-0 w-[89px] h-[20px]">
								<Image
									src="/segment-border.png"
									alt="бордер сегментов"
									width={89}
									height={20}
									className="absolute inset-0"
								/>
								<div
									className="absolute inset-0"
									style={{
										backgroundImage: "url('/segment-overlay.png')",
										backgroundSize: 'cover',
										mixBlendMode: 'overlay',
										opacity: 0.6
									}}
								/>
							</div>
							{/* Текст с объемной тенью */}
							<div className="relative inline-block top-2.5">
								{/* Тень */}
								<span
									style={{
										backgroundImage: ROULETTE_SHADOW_GRADIENT,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										color: 'transparent',
										fontFamily: 'Roboto Condensed, sans-serif',
										textTransform: 'uppercase',
										letterSpacing: '0.22',
										whiteSpace: 'nowrap',
										wordWrap: 'break-word'
									}}
									className="uppercase font-extrabold text-[22px] absolute top-0 left-0 translate-x-[1px] translate-y-[1px]"
								>
									{segment.label}
								</span>
								{/* Основной текст */}
								<span
									style={{
										backgroundImage: ROULETTE_NUMBER_GRADIENT,
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text',
										color: 'transparent',
										fontFamily: 'Roboto Condensed, sans-serif',
										textTransform: 'uppercase',
										letterSpacing: '0.22px',
										whiteSpace: 'nowrap',
										wordWrap: 'break-word'
									}}
									className="uppercase font-extrabold text-[22px] relative"
								>
									{segment.label}
								</span>
							</div>
						</div>
					))}

					{/* Центральный круг */}
					<div className="absolute inset-0 m-auto w-20 h-20 bg-gray-900 rounded-full" />
				</div>

				{/* Центр колеса */}
				<div className="absolute inset-0 m-auto w-20 h-20 flex items-center justify-center shadow-lg z-10">
					<div className="relative w-full h-full">
						<Image
							src="/center.png"
							alt="Center"
							fill
							sizes="80px"
							className="object-contain"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
