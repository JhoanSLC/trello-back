import { Router } from 'express';
import AuthRoutes from './modules/auth/routes/AuthRoutes';

const router = Router();

router.use('', AuthRoutes);

export default router
