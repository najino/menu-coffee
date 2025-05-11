import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { IsAuth } from "../common/decorator/auth.decorator";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CategoryService } from "./category.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
export class CategoryController {

    constructor(
        private readonly categoryService:CategoryService
    ){}
    @Post()
    @IsAuth()
    createCategory(@Body() createCategoryDto:CreateCategoryDto) {
        return this.createCategory(createCategoryDto);
    }


    @Get(":slug")
    getCategoryBySlug(@Param("slug") slug:string) {
        return this.categoryService.findBySlug(slug);
    }


    @Get()
    getCategories() {
        return this.categoryService.findAll();
    }


    @Patch(":id")
    @IsAuth()
    updateCategory(@Param("id")categoryId:string,@Body() updateCategoryDto:UpdateCategoryDto) {
        return this.categoryService.update(categoryId,updateCategoryDto);
    }


    @Delete(":id")
    @IsAuth()
    deleteCategory(@Param("id")categoryId:string) {
        return this.categoryService.remove(categoryId);
    }
}