import {
  Document,
  Filter,
  FindCursor,
  FindOptions,
  InsertOneResult,
  OptionalUnlessRequiredId,
  WithId,
} from 'mongodb';

export interface IRepo<T extends Document> {
  create(payload: OptionalUnlessRequiredId<T>): Promise<InsertOneResult<T>>;

  update(filter: Filter<T>, payload: Partial<T>): Promise<WithId<T> | null>;

  findOne(filter: Filter<T>): Promise<WithId<T> | null>;

  findAll(where: Filter<T>, options?: FindOptions): Promise<WithId<T>[]>;

  delete(filter: Filter<T>): Promise<WithId<T> | null>;
}
