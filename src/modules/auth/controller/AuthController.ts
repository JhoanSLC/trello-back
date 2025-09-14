import { Request, Response } from "express";
import { AuthService } from "../service/AuthService";
import { ApiResponse } from "../../../utils/apiResponse";
import { config } from "../../../config/config";

const service = new AuthService();

export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const data = await service.login(email, password);
            res.cookie('auth_token', data.token, {
                httpOnly: true,
                secure: config.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24,
                sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax'
            })
            return ApiResponse.success(res, 'Login successful', data);
        } catch (error) {
            return ApiResponse.error(res, error, 400);
        }
    }

}
