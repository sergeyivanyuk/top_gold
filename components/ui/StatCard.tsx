import Image from 'next/image'

interface StatCardProps {
	iconSrc: string
	iconAlt: string
	label: string
	value: string | number
	labelClassName?: string
	valueClassName?: string
}

export function StatCard({ iconSrc, iconAlt, label, value, labelClassName = 'text-stat-label', valueClassName = 'text-stat-value' }: StatCardProps) {
	return (
		<div className="flex flex-col items-center  p-[10px] rounded-card bg-radial-gold border-gold-light outline-offset-[-1px]">
			<div className="relative w-12 h-12">
				<Image
					src={iconSrc}
					alt={iconAlt}
					fill
					sizes="48px"
					className="object-contain"
				/>
			</div>
			<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
			<span className={labelClassName}>{label}</span>
			<span className={`${valueClassName} mt-2`}>{value}</span>
		</div>
	)
}
