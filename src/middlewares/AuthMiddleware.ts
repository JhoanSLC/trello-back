import { NextFunction, Request, Response } from "express";
import { config } from "../config/config";
import jwt from 'jsonwebtoken'

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const TOKEN = req.cookies?.auth_token || req.headers?.authorization?.split(' ')[1];

    if (!TOKEN) {
        res.status(401).json({ error: "Denied access. Token not found" });
        return
    }

    try {
        const SECRET_KEY = config.JWT;
        if (!SECRET_KEY) throw new Error('JWT secret key not found.');

        const decoded = jwt.verify(TOKEN, SECRET_KEY) as { user: { id: number, email: string }};
        req.user = decoded.user;

        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(403).json({ error: "Token expired" });
            return
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ error: "Invalid token" });
            return
        }

        res.status(500).json({ error: "Internal server error" });
    }
}
