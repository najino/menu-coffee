import { SessionOptions } from "express-session";
const session = require('express-session')
import * as sessionStore from 'connect-mongodb-session';
import { IEnv } from "../interface/env.interface";
import { INestApplication } from "@nestjs/common";


export function CreateSession(app: INestApplication) {
    // store Session Data into MongoDB
    const MongoDbStore = sessionStore(session)

    const store = new MongoDbStore({
        collection: "sessions",
        uri: (process.env as unknown as IEnv).MONGO_URI
    })

    const sessionOption: SessionOptions = {
        secret: process.env.SECRET || "some",
        resave: false,
        saveUninitialized: true,
        store,
    }


    app.use(session(sessionOption))
}
