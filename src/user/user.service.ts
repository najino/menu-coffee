import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException, } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { ObjectId, WithId } from 'mongodb';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    constructor(private readonly userRepository: UserRepository, protected readonly jwt: JwtService) { }


    async createUser({ password, username }: CreateUserDto): Promise<{ msg: string, id: ObjectId }> {
        try {
            // check username is unique or not
            const isUserNameUnique = await this.userRepository.findOne({ username });

            if (isUserNameUnique)
                throw new ConflictException("username is exist before.")

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


    async login({ password, username }: LoginUserDto): Promise<{ msg: string, accessToken: string }> {
        // check user 
        const user = await this.userRepository.findOne({ username });
        if (!user)
            throw new NotFoundException("invalid credential.")

        // validate password
        const isValidPassword = await compare(password, user.password)

        if (!isValidPassword)
            throw new NotFoundException("invalid credential.")

        const accessToken = await this.jwt.signAsync({
            id: user._id,
            username: user.username
        }, { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: `${process.env.ACCESS_TOKEN_EXPIRE}day` })


        return {
            msg: "user login successfully",
            accessToken: accessToken
        }
    }

}
