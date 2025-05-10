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
import { IsAuth } from '../decorator/auth.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @IsAuth()
  @ApiOperation({ summary: "Register new User" })
  @ApiTags('Admin')
  @ApiBearerAuth('JWT-AUTH')
  @ApiCreatedResponse({
    description: 'user Created successfully',
    schema: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
        accessToken: { type: 'string', description: 'AccessToken' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "user can't access to this route" })
  @ApiConflictResponse({ description: 'username is exist before.' })
  @ApiBody({ type: CreateUserDto })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: "Get AccessToken" })
  @ApiNotFoundResponse({ description: 'credential are invalid' })
  @ApiOkResponse({
    description: 'user login successfully',
    schema: {
      type: 'object',
      properties: {
        msg: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto, @Req() req: Request) {
    return this.userService.login(loginDto);
  }
}
