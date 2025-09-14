import { Response } from "express"

export class ApiResponse {
    static success(res: Response, message: string, data: any = null, statusCode: number = 200) {
        return res.status(statusCode).json({ message, data })
    }

    static error(res: Response, error: any, statusCode: number = 400) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        return res.status(statusCode).json({ error: errorMessage })
    }
}
