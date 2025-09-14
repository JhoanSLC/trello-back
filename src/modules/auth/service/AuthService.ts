import { AuthRepository } from "../repository/AuthRepository";
import bcrypt from 'bcrypt';


export class AuthService {

    private repository = new AuthRepository();

    async login(email: string, password: string) {

        const USER = await this.repository.findUserByEmail(email);

        if(!USER) throw new Error(JSON.stringify({
            errors: {
                email: 'This user does not exists in the system.'
            }
        }))

        const VALID = await bcrypt.compare(password, USER.password);

        if (!VALID) throw new Error(JSON.stringify({
            errors: {
                password: ["Oops! The password you entered is incorrect."],
            }
        }))

        return USER
    }
}
