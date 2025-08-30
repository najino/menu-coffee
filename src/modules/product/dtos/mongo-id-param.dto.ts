import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongodb';

export class MongoIdDto {
  @IsNotEmpty({ message: 'please enter Id' })
  @IsMongoId({ message: 'id is invalid' })
  id: ObjectId;
}
