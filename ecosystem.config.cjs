module.exports = {
	apps: [
		// Основное приложение Next.js
		{
			name: 'topgold-store',
			script: 'node_modules/next/dist/bin/next',
			args: 'start',
			cwd: './',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				NODE_ENV: 'production',
				PORT: 3000
			},
			env_production: {
				NODE_ENV: 'production',
				PORT: 3000
			}
		},
		// Cron задача для отправки вечерней статистики
		{
			name: 'evening-stats-cron',
			script: './scripts/eveningStatsCron.cjs',
			cron_restart: '0 20 * * *', // каждый день в 20:00 UTC
			autorestart: false,
			watch: false,
			env: {
				NODE_ENV: 'production',
				NEXT_PUBLIC_BASE_URL: 'https://topgold.store'
			}
		}
	]
}
