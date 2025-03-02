import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { IsAuth } from '../decorator/auth.decorator';
import { ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
  login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto)
  }
}
