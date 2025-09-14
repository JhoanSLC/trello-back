import { Transaction, fn, col } from "sequelize";
import { User } from "../../../models/User";
import { urlBucket } from "../../../utils/storage";

export class AuthRepository {

    private BUCKET = urlBucket();

    async findUserByEmail(email: string) {
        return await User.findOne({
            where: {
                email: email
            },
            raw: true,
            nest: true
        })
    }

    async findUserById(id: number, transaction?: Transaction) {
        return await User.findByPk(id, {
            attributes: [
                ['id', 'idUser'],
                'name',
                'lastName',
                [fn('CONCAT', this.BUCKET, col('photo')), 'photo'],
                'status',
            ],
            raw: true,
            nest: true
        })
    }

}
