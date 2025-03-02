import { SessionOptions } from "express-session";

export const sessionOption: SessionOptions = {
    secret: process.env.SECRET || "some",
    resave: false,
    saveUninitialized: true,
}