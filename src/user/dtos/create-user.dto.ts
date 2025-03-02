import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username is required.' })
  @IsString({ message: 'username must be string. ' })
  @MinLength(3, { message: 'username cannot be less than 3 characters.' })
  @ApiProperty()
  username: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(5, { message: 'Password cannot be less than 5 characters.' })
  @ApiProperty()
  password: string;
}
