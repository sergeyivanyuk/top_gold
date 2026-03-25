import Image from 'next/image'

interface FeatureCardProps {
	iconSrc: string
	iconAlt: string
	title: string
	className?: string
}

export function FeatureCard({ iconSrc, iconAlt, title, className = '' }: FeatureCardProps) {
	return (
		<div className={`flex flex-col items-center px-6 py-4 rounded-card bg-radial-gold border-gold-light outline-offset-[-1px] ${className}`}>
			<div className="relative w-12 h-12">
				<Image
					src={iconSrc}
					alt={iconAlt}
					fill
					className="object-contain"
				/>
			</div>
			<div className="self-stretch h-0 opacity-40 outline-1 outline-offset-[-0.50px] outline-orange-200 my-2" />
			<span className="text-secondary-title text-center">{title}</span>
		</div>
	)
}
