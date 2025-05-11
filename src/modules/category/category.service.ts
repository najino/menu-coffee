import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ObjectId } from "mongodb";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {

    constructor(private readonly categoryRepository: CategoryRepository) { }

    private logger = new Logger(CategoryService.name)

    async create(categoryData: CreateCategoryDto) {
        const slug = this.slugify(categoryData.slug);
        const category = await this.categoryRepository.findBySlug(slug)
        if(category)
            throw new BadRequestException("Category Is Exist Before.")

        try{
            const result = await this.categoryRepository.create({...categoryData,slug});
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
        const result = await this.categoryRepository.findBySlug(this.slugify(slug));
        if(!result)
            throw new NotFoundException("Category Not Found.")


        return result;
    }


    async update(id: string, categoryData: UpdateCategoryDto) {
        try{
        const category = await this.categoryRepository.findOne({_id:new ObjectId(id)});

        if(!category)
            throw new NotFoundException("Category Not Found");

        if(categoryData.slug)
            categoryData.slug = this.slugify(categoryData.slug);

        return this.categoryRepository.update(new ObjectId(id), categoryData);
 
        }catch(err){
            if(err instanceof HttpException)
                throw err;

            this.logger.error(err)
            throw new InternalServerErrorException()
        }
   }

    async remove(id: string) {
        const category = await this.categoryRepository.findOne({_id:new ObjectId(id)});

        if(!category)
            throw new NotFoundException("Category Not Found");

        return this.categoryRepository.delete({_id:new ObjectId(id)});
    }


    private slugify(slug:string){
        return slug.split(' ').join('-').trim()

    }
}