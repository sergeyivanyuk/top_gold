import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		unoptimized: true, // Отключаем оптимизацию для статических файлов
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**'
			}
		]
	}
}

export default nextConfig
