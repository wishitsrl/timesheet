import express from 'express';
import { getProfile, updateProfile, changePassword, getAllUsers, updateUserRole, activateUser, deleteUser } from '../controllers/profile.controller';
import { verifyToken } from '../middleware/verifyToken';
import rateLimiter from '../helpers/rateLimiter';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types/roles.enum';

const router = express.Router();
const profileRateLimiter = rateLimiter(1000, 5);

router.get('/', verifyToken, profileRateLimiter, getProfile);
router.put('/', verifyToken, profileRateLimiter, updateProfile);
router.put('/change-password', verifyToken, profileRateLimiter, changePassword);
router.get('/users', verifyToken, checkRole([UserRole.ADMIN]), profileRateLimiter, getAllUsers);
router.patch('/users/:id/role', verifyToken, checkRole([UserRole.ADMIN]), profileRateLimiter, updateUserRole);
router.patch('/users/:id/active', verifyToken, checkRole([UserRole.ADMIN]), profileRateLimiter, activateUser);
router.delete('/users/:id', verifyToken, checkRole([UserRole.ADMIN]), profileRateLimiter, deleteUser);

export default router;
