import { IsNumberString, IsOptional, IsString } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsNumberString()
    @IsString()
    page: string

    @IsOptional()
    @IsNumberString()
    @IsOptional()
    limit: string
}