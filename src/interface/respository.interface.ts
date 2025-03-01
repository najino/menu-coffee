import { FindOptions, ObjectId } from "mongodb";

export interface IRepository<T> {
	create(payload: T): Promise<T>;
	findOne(id: ObjectId): Promise<T>;
	find(where?: FindOptions): Promise<T[]>;
	update(id: ObjectId, payload: Partial<T>): Promise<T>;
	delete(id: ObjectId): Promise<T>;
}
