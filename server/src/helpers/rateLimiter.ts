import rateLimit from 'express-rate-limit';

const rateLimiter = (windowMs: number, maxRequests: number) => {
	return rateLimit({
		windowMs,
		limit: maxRequests,
		message: { success: false, message: '❌ Troppi tentativi. Riprova tra 1 minuto.' },
		standardHeaders: 'draft-7',
		legacyHeaders: false,
	});
};

export default rateLimiter;
