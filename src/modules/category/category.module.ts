import { Module } from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";

@Module({
    controllers: [CategoryController],
    providers: [CategoryRepository, CategoryService]
})
export class CategoryModule { }