import { Test } from "@nestjs/testing"
import { CategoryService } from "../category.service"
import { CategoryRepository } from "../category.repository"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { ObjectId } from "mongodb"

// categoryService Test
describe("CategoryService",()=>{

    let service:CategoryService

    const fakeObjectId= "507f1f77bcf86cd799439011";

    let repository = {
        create:jest.fn(),
        delete:jest.fn(),
        findAll:jest.fn(),
        findBySlug:jest.fn(),
        findOne:jest.fn(),
        update:jest.fn()
    } 

    beforeEach(async ()=>{
        const moduleRef = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide: CategoryRepository,
                    useValue: repository
                }
            ]
        }).compile()

        service = moduleRef.get<CategoryService>(CategoryService)

    })


    it("Should be defined",()=>{
        expect(repository).toBeDefined()
        expect(service).toBeDefined()
    })


    describe("Create",()=>{
        
        let createCategoryPayload= {name:"test-name",slug:"test-slug"}

        it("Should be Create Category",async ()=>{
            repository.findBySlug.mockResolvedValueOnce(null)
            repository.create.mockResolvedValueOnce({acknowledged:true})
        
            const result = await service.create(createCategoryPayload);
        
            expect(result).toEqual(true)
            expect(repository.create).toHaveBeenCalledWith({
                slug:"test-slug",
                name:'test-name'
            })
        
            expect(repository.findBySlug).toHaveBeenCalledWith('test-slug')
        })
    
    
        it("Should be Throw BadRequest Because Slug is exist",async ()=>{
            repository.findBySlug.mockResolvedValue(createCategoryPayload)

            expect(service.create(createCategoryPayload)).rejects.toThrow(BadRequestException)
            expect(service.create(createCategoryPayload)).rejects.toThrow("Category Is Exist Before.")
        })
    })


    describe("findBySlug",()=>{
        it("Should be Throw NotFound",()=>{
           repository.findBySlug.mockResolvedValueOnce(null) 

           expect(service.findBySlug('test-slug')).rejects.toThrow(NotFoundException)
        })
    })



    describe("Update",()=>{
        const updatedData = {
            name:"new-name",
            slug:"new-slug"
        }

        it("Should be Updated",async ()=>{

            repository.findOne.mockResolvedValue({name:"name",slug:"test-slug"});
            repository.update.mockResolvedValueOnce(updatedData);

            const result = await service.update(fakeObjectId,updatedData);

            expect(result?.name).toEqual('new-name');
            expect(result?.slug).toEqual('new-slug');
            expect(repository.findOne).toHaveBeenCalledWith({_id:new ObjectId(fakeObjectId)})
        })
    })


    describe("Remove",()=>{
        const removedCategory = {name:"test-name",slug:"test-slug"}

        it("Should be Removed",async ()=>{
            repository.findOne.mockResolvedValueOnce({})
            repository.delete.mockResolvedValueOnce(removedCategory)

            const result =  await service.remove(fakeObjectId)

            expect(result?.name).toEqual("test-name")
            expect(result?.slug).toEqual("test-slug")
            expect(repository.findOne).toHaveBeenCalledWith({_id:new ObjectId(fakeObjectId)})
        
        })
    })







})