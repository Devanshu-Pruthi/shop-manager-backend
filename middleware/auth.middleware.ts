import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user.model';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let userId;

    if (req.headers['x-user-id']) {
        userId = req.headers['x-user-id'] as string;
    }

    if (!userId) {
        res.status(401).json({ message: 'Not authorized, no user id' });
        return;
    }

    try {
        // Handle static admin for development
        if (userId === '000000000000000000000001') {
            req.user = {
                _id: '000000000000000000000001',
                name: 'Admin User',
                role: 'admin',
                email: 'admin@gmail.com'
            } as any;
            return next();
        }

        const user = await User.findById(userId);
        if (user) {
            req.user = user;
            next();
        } else {
            res.status(401).json({ message: 'Not authorized, user not found' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, invalid user id' });
    }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
