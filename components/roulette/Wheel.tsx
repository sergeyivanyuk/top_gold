import { ROULETTE_SEGMENTS } from '@/config/roulette'
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
			<div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
				<div className="relative w-12 h-12">
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
			<div className="absolute left-2 top-1/2 -translate-x-1/3 -translate-y-1/2 z-10">
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
			<div className="absolute right-2 top-1/2 translate-x-1/3 -translate-y-1/2 z-10">
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
			<div className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-1/3 z-10">
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
				className="relative w-73 h-73 md:w-80 md:h-80 rounded-full shadow-2xl overflow-hidden"
				style={{ transform: `rotate(${rotation}deg)` }}
			>
				<div className={cn('absolute inset-0', !isSpinning && 'animate-sway')}>
					{/* Изображение колеса рулетки (референс) */}
					<div
						className="absolute inset-0 w-full"
						style={{
							backgroundImage: "url('/wheel.png')",
							backgroundSize: 'cover',
							backgroundRepeat: 'no-repeat',
							backgroundPosition: 'center'
						}}
					/>

					{/* Текст и иконки на сегментах */}
					{ROULETTE_SEGMENTS.map((segment, index) => (
						<div
							key={segment.id}
							className="absolute inset-0 flex flex-col items-center justify-center"
							style={{
								transform: `rotate(${index * segmentAngle + segmentAngle}deg)`
							}}
						>
							<div
								className="absolute w-6 h-6"
								style={{ bottom: '4.5rem' }}
							>
								<Image
									src="/gold-one.png"
									alt="голда"
									fill
									sizes="24px"
									className="object-contain drop-shadow-lg"
									style={{ filter: 'brightness(1.2)' }}
								/>
							</div>
							{/* Текст с объемной тенью */}
							<div
								className="relative inline-block"
								style={{ bottom: '6rem' }}
							>
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
					<div className="absolute inset-0 m-auto w-18 h-18 bg-gray-900 rounded-full" />
				</div>

				{/* Центр колеса */}
				<div className="absolute inset-0 m-auto w-18 h-18 flex items-center justify-center shadow-lg z-10">
					<div className="relative w-full h-full">
						<Image
							src="/center.png"
							alt="Center"
							fill
							sizes="72px"
							className="object-contain"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
