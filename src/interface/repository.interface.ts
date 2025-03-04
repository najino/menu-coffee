import { Document, DeleteResult, Filter, FindCursor, FindOptions, InsertOneResult, OptionalUnlessRequiredId, UpdateResult, WithId } from "mongodb"

export interface IRepo<T extends Document> {
    create(payload: OptionalUnlessRequiredId<T>): Promise<InsertOneResult<T>>

    update(filter: Filter<T>, paylaod: Partial<T>): Promise<WithId<T> | null>

    findOne(filter: Filter<T>): Promise<WithId<T> | null>

    findAll(where: Filter<T>, options?: FindOptions): Promise<FindCursor<WithId<T>>>

    delete(filter: Filter<T>): Promise<WithId<T> | null>

}
