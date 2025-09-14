import cookieParser from "cookie-parser";
import cors from 'cors';
import express from 'express'
import morgan from 'morgan'
import { config } from "./config/config";
import { notFoundMiddleware } from "./middlewares/NotFoundMiddleware";
import { connectDb } from "./config/database";
import routes from './routes'

const APP = express();
const PORT = config.PORT || 3000;

APP.use(cors({
    origin: config.CLIENT_URL || "*",
    credentials: true
}))

APP.use(express.json({limit: "50mb"}));
APP.use(express.urlencoded({limit: "50mb", extended: true}));
APP.use(cookieParser());

APP.use(morgan('dev'));
APP.use("/storage", express.static(config.STORAGE));

APP.use("/api", routes)

APP.use(notFoundMiddleware);

// Initialize application
const main = async () => {
    try {
        await connectDb();
        APP.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        })
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

main()
