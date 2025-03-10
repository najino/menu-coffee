import { ApiProperty } from "@nestjs/swagger";

export class HttpExceptionDto {
    @ApiProperty()
    error: string;
    @ApiProperty()
    statusCode: number
    @ApiProperty()
    message: string
}