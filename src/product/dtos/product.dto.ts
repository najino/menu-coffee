import { ApiProperty } from "@nestjs/swagger"

export class ProductDto {

    @ApiProperty({ type: "string", description: "Product id" })
    _id: string
    @ApiProperty({ type: "string", description: "Product Name" })
    name: string;
    @ApiProperty({ type: 'string', description: "img Path" })
    img: string
    @ApiProperty({ type: "array", description: "Array Of Models" })
    models: string[]
    @ApiProperty({ type: "string", description: "price of product" })
    price: string
    @ApiProperty({ type: "boolean", description: "the product an already exist or not" })
    status: boolean
    @ApiProperty({ type: "string", description: "Product Description" })
    description: string

}