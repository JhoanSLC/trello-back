import {
    AllowNull, AutoIncrement, BeforeCreate, BeforeUpdate, BelongsTo, Column, Comment, DataType, Default, ForeignKey,
    IsEmail, Model, PrimaryKey, Table, Unique
} from "sequelize-typescript";
import { config } from "../config/config";
import bcrypt from 'bcrypt';

@Table({
    tableName: 'users',
    timestamps: true
})
export class User extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column(DataType.MEDIUMINT.UNSIGNED)
    id!: number;

    @Unique
    @IsEmail
    @AllowNull(false)
    @Column(DataType.STRING(100))
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(120))
    password!: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name!: string

    @AllowNull(true)
    @Column(DataType.STRING(50))
    middleName!: string

    @AllowNull(false)
    @Column(DataType.STRING(50))
    lastName!: string

    @AllowNull(true)
    @Column(DataType.STRING(50))
    secondLastName!: string

    @AllowNull(false)
    @Comment('1=Active 2=Inactive')
    @Default(1)
    @Column(DataType.TINYINT.UNSIGNED)
    status!: number

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.MEDIUMINT.UNSIGNED)
    createdBy?: number

    @BelongsTo(() => User)
    userCreator?: User

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.MEDIUMINT.UNSIGNED)
    updatedBy?: number

    @BelongsTo(() => User)
    userUpdater?: User

    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(user: User) {
        if (user.password && user.changed('password')) {
            user.password = await bcrypt.hash(user.password, config.SALT_ROUNDS);
        }
    }
}
