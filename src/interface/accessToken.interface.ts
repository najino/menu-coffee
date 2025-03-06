import { ObjectId } from "mongodb";

export interface AccessTokenPayload {
    id: ObjectId,
    username: string
}