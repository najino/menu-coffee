import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { IsAuth } from "../common/decorator/auth.decorator";

@Controller("categories")
export class CategoryController {

    @Post()
    @IsAuth()
    createCategory() { }


    @Get(":slug")
    getCategoryBySlug() { }


    @Get()
    getCategories() { }


    @Patch(":id")
    @IsAuth()
    updateCategory() { }


    @Delete(":id")
    @IsAuth()
    deleteCategory() { }
}