import { Body, Controller, HttpCode, HttpStatus, Post, Req, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { IsAuth } from '../decorator/auth.decorator';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @IsAuth()
  @ApiCreatedResponse({
    description: "user Created successfully", schema: {
      type: "object",
      properties: {
        msg: { type: "string" },
        id: { type: "string", description: "userId" }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: "user can't access to this route" })
  @ApiConflictResponse({ description: "username is exsist before." })
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto, @Req() req: Request) {
    const user = await this.userService.login(loginDto)

    req.session.user = {
      id: user._id,
      username: user.username
    }

    return { msg: "user login successfully" }
  }
}
