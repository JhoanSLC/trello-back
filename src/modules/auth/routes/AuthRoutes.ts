import { Router } from "express";
import { validateSchema } from "../../../middlewares/ValidateSchema";
import { AuthValidator } from "../validator/AuthValidator";
import { AuthController } from "../controller/AuthController";


const router = Router();

router.post('/login', validateSchema(AuthValidator.loginSchema), AuthController.login);

export default router
