import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ObjectId } from "mongodb";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {

    constructor(private readonly categoryRepository: CategoryRepository) { }
    async create(categoryData: CreateCategoryDto) {
        const category = await this.categoryRepository.findBySlug(categoryData.slug)
        if(category)
            throw new BadRequestException("Category Is Exist Before.")

        return this.categoryRepository.create(categoryData);
    }

    async findAll() {
        return this.categoryRepository.findAll();
    }

    async findBySlug(slug: string) {
        return this.categoryRepository.findBySlug(slug);
    }


    async update(id: string, categoryData: UpdateCategoryDto) {
        const category = await this.categoryRepository.findOne({_id:new ObjectId(id)});
        if(!category)
            throw new NotFoundException("Category Not Found");

        return this.categoryRepository.update(new ObjectId(id), categoryData);
    }

    async remove(id: string) {
        const category = await this.categoryRepository.findOne({_id:new ObjectId(id)});

        if(!category)
            throw new NotFoundException("Category Not Found");

        return this.categoryRepository.delete({_id:new ObjectId(id)});
    }
}