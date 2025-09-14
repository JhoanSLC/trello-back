import { Sequelize } from 'sequelize-typescript';
import { config } from './config';

const IS_PRODUCTION = ["production", "dev"].includes(config.NODE_ENV);

export const connection = new Sequelize({
    dialect: config.database.DIALECT,
    host: config.database.HOST,
    port: config.database.PORT,
    username: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    models: [__dirname + '/../models/*.' + (IS_PRODUCTION ? 'js' : 'ts')]
})

export const connectDb = async () => {
    try {
        await connection.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.log('Unable to connect to the database:', error);
    }
}
