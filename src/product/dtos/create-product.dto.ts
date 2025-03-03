import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import Decimal from "decimal.js";

export class CreateProductDto {
    @IsNotEmpty({ message: "name is required." })
    @IsString({ message: "name must be string." })
    @ApiProperty()
    name: string

    @IsString({ message: "please send as string format." })
    @IsNotEmpty({ message: "price cannot be empty." })
    @ApiProperty()
    price: Decimal

    @IsOptional()
    @IsArray({ message: "please enter array of string in models." })
    @IsString({ each: true, message: "models must be array of string." })
    @ArrayMinSize(1, { message: "models cannot be less than 1 item" })
    @ApiProperty()
    models: string[]

    @IsNotEmpty({ message: "description cannot be empty." })
    @IsString({ message: "typeof description must be string" })
    @ApiProperty()
    description: string


    @IsNotEmpty({ message: "status cannot be empty" })
    @IsBoolean({ message: "status must be boolean." })
    @ApiProperty({ description: "a product is exsist or not." })
    status: boolean
}