import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { genSalt, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(private readonly userRepository: UserRepository) { }


    async createUser({ password, username }: CreateUserDto): Promise<{ msg: string, id: ObjectId }> {
        try {
            // check username is unique or not
            const isUserNameUnique = await this.userRepository.findOne({ username });

            if (isUserNameUnique)
                throw new ConflictException("username is exsist before.")

            // hashPassword
            const salt = await genSalt()
            const hashPass = await hash(password, salt)

            // insert 
            const { insertedId } = await this.userRepository.create({ password: hashPass, username })

            return {
                msg: "user created successfully",
                id: insertedId
            };

        } catch (err) {
            if (err instanceof HttpException)
                throw err;

            this.logger.error(err)
            throw new InternalServerErrorException(err)
        }
    }


    login({ password, username }: LoginUserDto) {
        try {
            return true;
        } catch (err) {
            this.logger.error(err)
            throw new InternalServerErrorException(err)
        }
    }

}
