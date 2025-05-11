import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ObjectId } from "mongodb";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {

    constructor(private readonly categoryRepository: CategoryRepository) { }

    private logger = new Logger(CategoryService.name)

    async create(categoryData: CreateCategoryDto) {
        const category = await this.categoryRepository.findBySlug(categoryData.slug)
        if(category)
            throw new BadRequestException("Category Is Exist Before.")

        try{
            const result = await this.categoryRepository.create(categoryData);
            return result.acknowledged
        }catch(err){
            this.logger.error(err)
            throw new InternalServerErrorException();
        }
   }

    async findAll() {
        return this.categoryRepository.findAll();
    }

    async findBySlug(slug: string) {
        const result = await this.categoryRepository.findBySlug(slug);
        if(!result)
            throw new NotFoundException("Category Not Found.")


        return result;
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