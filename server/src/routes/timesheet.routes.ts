import express from 'express';
import { getTimesheet, getTimesheetById, postTimesheet, updateTimesheet, deleteTimesheet, downloadMonthlyPdf} from '../controllers/timesheet.controller';
import { verifyToken } from '../middleware/verifyToken';
import rateLimiter from '../helpers/rateLimiter';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types/roles.enum';

const router = express.Router();
const profileRateLimiter = rateLimiter(1000, 5);

router.get('/allTimesheetList', verifyToken, profileRateLimiter, getTimesheet);
// Aggiungi downloadMonthlyPdf agli import
router.get('/downloadPdf', verifyToken, downloadMonthlyPdf);
router.get('/getTimesheetById/:id', verifyToken, profileRateLimiter, getTimesheetById);
router.post('/postTimesheet', verifyToken, profileRateLimiter, postTimesheet);
router.put('/updateTimesheet/:id', verifyToken, profileRateLimiter, updateTimesheet);
router.delete('/deleteTimesheet/:id', verifyToken, checkRole([UserRole.ADMIN]), profileRateLimiter, deleteTimesheet);

export default router;