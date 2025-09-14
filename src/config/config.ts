import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

const dialects: Dialect[] = ['mysql', 'postgres', 'sqlite', 'mariadb'];
const dbDialect = process.env.DB_CONNECTION as Dialect;

if (!dbDialect || !dialects.includes(dbDialect)) {
    throw new Error('Invalid database dialect');
}

const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

export const config = {
    JWT: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    PORT: process.env.PORT || 3000,
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    database: {
        DIALECT: dbDialect,
        HOST: process.env.DB_HOST || 'localhost',
        PORT: dbPort,
        USERNAME: process.env.DB_USERNAME || 'root',
        PASSWORD: process.env.DB_PASSWORD || '',
        DATABASE: process.env.DB_DATABASE || 'trello',
        LOGGIN: false
    },
    aws: {
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        REGION: process.env.AWS_DEFAULT_REGION,
        BUCKET: process.env.AWS_BUCKET
    },
    STORAGE: process.env.ROUTE_STORAGE || 'storage',
    STORAGE_URL: process.env.STORAGE || 'http://localhost:3000',
    SALT_ROUNDS: process.env.SALT_ROUNDS || 10
}
