import { Collection, Document, Filter, FindOptions, OptionalUnlessRequiredId } from "mongodb";
import { IRepo } from "../interface/repository.interface";

export class Repository<T extends Document> implements IRepo<T> {

    constructor(private readonly model: Collection<T>) { }

    async create(payload: OptionalUnlessRequiredId<T>) {
        return this.model.insertOne(payload)
    }

    async delete(filter: Filter<T>) {
        return this.model.findOneAndDelete(filter)
    }

    async findAll(where?: Filter<T>, options?: FindOptions) {
        return this.model.find(where || {}, options)
    }

    async findOne(filter: Filter<T>) {
        return this.model.findOne(filter)
    }

    async update(filter: Filter<T>, payload: Partial<T>) {
        return this.model.findOneAndUpdate(filter, { $set: payload }, { returnDocument: "after" })
    }
}