import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUserPayload {
	username: string;
	role: string;
	iat?: number;
	exp?: number;
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: AuthUserPayload;
	}
}

const getTokenFromHeader = (req: Request): string | null => {
	const authHeader = req.headers['authorization'] || req.headers['Authorization'];
	if (!authHeader) return null;
	const value = Array.isArray(authHeader) ? authHeader[0] : authHeader;
	if (!value.startsWith('Bearer ')) return null;
	return value.slice('Bearer '.length).trim();
};

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const token = getTokenFromHeader(req);
		if (!token) {
			res.status(401).json({ message: 'Missing Authorization header' });
			return;
		}
		const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
		const payload = jwt.verify(token, secret) as AuthUserPayload;
		req.user = { username: payload.username, role: payload.role };
		next();
		return;
	} catch (err) {
		res.status(401).json({ message: 'Invalid or expired token' });
		return;
	}
};

export const authorizeRoles = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ message: 'Unauthorized' });
			return;
		}
		if (!roles.includes(req.user.role)) {
			res.status(403).json({ message: 'Forbidden' });
			return;
		}
		next();
		return;
	};
};

export const authorizeSelfOrRoles = (paramKey: string, ...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ message: 'Unauthorized' });
			return;
		}
		const paramValue = (req.params as any)[paramKey];
		if (paramValue === req.user.username) {
			next();
			return;
		}
		if (roles.includes(req.user.role)) {
			next();
			return;
		}
		res.status(403).json({ message: 'Forbidden' });
		return;
	};
};


