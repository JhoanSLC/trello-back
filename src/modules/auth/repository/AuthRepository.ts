import { User } from "../../../models/User";

export class AuthRepository {

    async findUserByEmail(email: string) {
        return await User.findOne({
            where: {
                email: email
            },
            raw: true,
            nest: true
        })
    }

}
