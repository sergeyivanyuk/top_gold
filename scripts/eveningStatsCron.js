const https = require('https')
const http = require('http')

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const ENDPOINT = '/api/statistics/evening'

const url = new URL(ENDPOINT, NEXT_PUBLIC_BASE_URL)

const protocol = url.protocol === 'https:' ? https : http

const req = protocol.request(url, { method: 'GET' }, res => {
	let data = ''
	res.on('data', chunk => (data += chunk))
	res.on('end', () => {
		if (res.statusCode === 200) {
			console.log('Вечерняя статистика отправлена:', data)
			process.exit(0)
		} else {
			console.error('Ошибка отправки:', res.statusCode, data)
			process.exit(1)
		}
	})
})

req.on('error', err => {
	console.error('Ошибка запроса:', err.message)
	process.exit(1)
})

req.end()
