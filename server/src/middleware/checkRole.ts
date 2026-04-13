import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/authRequest';
import { UserRole } from '../types/roles.enum';

export const checkRole = (allowedRoles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        if (user.role === UserRole.ADMIN) {
            return next();
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }

        next();
    };
};