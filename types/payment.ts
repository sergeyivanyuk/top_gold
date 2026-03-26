// Типы для платежей

export enum PaymentMethod {
	SBP = 'sbp',
	CARD = 'card',
	YOOMONEY = 'yoomoney',
	QIWI = 'qiwi',
	OTHER = 'other'
}

export enum PaymentStatus {
	PENDING = 'pending',
	SUCCESS = 'success',
	FAILED = 'failed',
	CANCELED = 'canceled'
}

export interface PaymentTariff {
	id: string
	name: string
	price: number
	spins: number
	bonusSpins: number
}

export interface PaymentRequest {
	tariff: string
	price: number
	paymentMethod: PaymentMethod
	nickname: string
	email?: string
	phone?: string
	promoCode?: string
}

export interface PaymentResponse {
	paymentId: string
	status: PaymentStatus
	paymentUrl?: string // ссылка для редиректа на оплату
	message?: string
}

export interface PaymentWebhookData {
	paymentId: string
	status: PaymentStatus
	amount: number
	currency: string
	timestamp: string
	metadata?: Record<string, any>
}
