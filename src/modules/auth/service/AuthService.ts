import { config } from "../../../config/config";
import { AuthRepository } from "../repository/AuthRepository";
import bcrypt from 'bcrypt';
import jwt, { SignOptions} from 'jsonwebtoken'


export class AuthService {

    private repository = new AuthRepository();

    async login(email: string, password: string) {
        const USER = await this.repository.findUserByEmail(email);

        if (!USER) throw new Error(JSON.stringify({
            errors: {
                email: 'This user does not exists in the system.'
            }
        }));

        const VALID = await bcrypt.compare(password, USER.password); // Compare password

        if (!VALID) throw new Error(JSON.stringify({
            errors: {
                password: ["Oops! The password you entered is incorrect."],
            }
        }));

        if (!config.JWT) throw new Error('JWT secret key is not set');

        const payload = { // Payload to sign token
            user: {
                id: USER.id,
                email: USER.email
            }
        };

        const expiresIn = config.JWT_EXPIRES_IN ?? '1d';

        const token = jwt.sign(payload, config.JWT, {
            expiresIn,
        } as SignOptions);

        const finalUser = await this.repository.findUserById(USER.id);

        return { user: finalUser, token };
    }
}
