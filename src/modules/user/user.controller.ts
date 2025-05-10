import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { Request } from 'express';
import { IsAuth } from '../common/decorator/auth.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @IsAuth()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto, @Req() req: Request) {
    return this.userService.login(loginDto);
  }
}
