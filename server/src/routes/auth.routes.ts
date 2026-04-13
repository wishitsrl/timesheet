import { Router } from 'express';
import {
  signup,
  signin,
  signout,
  resetPassword,
  refreshToken
} from '../controllers/auth.controller';
import { verifyToken } from '../middleware/verifyToken';
import rateLimiter from '../helpers/rateLimiter';

const router = Router();
const authRateLimiter = rateLimiter(1000, 5);

router.post('/register', authRateLimiter, signup);
router.post('/login', authRateLimiter, signin);
router.delete('/logout', authRateLimiter, verifyToken, signout);
router.post('/reset-password/:token', authRateLimiter, resetPassword);
router.post('/refresh-token', authRateLimiter, verifyToken, refreshToken);

export default router;