import { Request, Response, NextFunction } from "express"

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        error: "Route not found",
        message: `Route '${req.originalUrl}' does not exist on this server. `
    })
}
