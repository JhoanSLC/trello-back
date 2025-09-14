import { Request, Response, NextFunction } from "express"

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        error: "Ruta no encontrada",
        message: `La ruta '${req.originalUrl}' no existe en este servidor.`
    })
}
