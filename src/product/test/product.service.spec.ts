import { Test } from "@nestjs/testing"
import { ProductService } from "../product.service"
import { ProductRepository } from "../product.repository"
import { ObjectId } from "mongodb"
import * as fs from 'fs'
import Decimal from "decimal.js";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

describe("Product Service", () => {

    let service: ProductService
    const productRepoMock: Partial<ProductRepository> = {
        create: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: ProductRepository,
                    useValue: productRepoMock
                }
            ]
        }).compile()


        service = module.get(ProductService);
    })


    it("Should be defined", () => {
        expect(service).toBeDefined();
    })


    describe("create Product", () => {
        it("should be create Product", async () => {

            const objId = "1234" as unknown as ObjectId

            jest.spyOn(productRepoMock, 'create').mockResolvedValueOnce({ insertedId: objId, acknowledged: true })

            jest.spyOn(fs, 'createWriteStream').mockReturnValueOnce({
                write: () => {
                    return true
                }
            } as unknown as fs.WriteStream)

            jest.spyOn(productRepoMock, 'findOne').mockResolvedValueOnce({
                _id: objId,
                description: "Test Description",
                img: "path",
                models: [],
                name: "Test Product",
                price: "100",
                status: true
            })

            const mockFile = {
                originalname: 'test.jpg',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;


            const createProductDto = {
                name: 'Test Product',
                description: 'Test Description',
                price: '100',
                models: [],
                status: '1'
            };
            const result = await service.createProduct(createProductDto, mockFile)


            expect(productRepoMock.findOne).toHaveBeenCalledWith({ _id: objId })

            expect(fs.createWriteStream).toHaveBeenCalled()

            expect(result).toEqual({
                _id: '1234',
                name: 'Test Product',
                description: 'Test Description',
                img: 'path',
                price: new Decimal(100).valueOf(),
                models: [],
                status: true
            });

        })

        it('should throw InternalServerErrorException if repository fails', async () => {
            productRepoMock.create = jest.fn().mockRejectedValue(new Error('DB error'));

            const createProductDto = {
                name: 'Test Product',
                description: 'Test Description',
                price: '100',
                models: [],
                status: '1'
            };

            const mockFile = {
                originalname: 'test.jpg',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            await expect(service.createProduct(createProductDto, mockFile)).rejects.toThrow(InternalServerErrorException);
        });


        it("Should throw BadRequest if has Error During UploadFile", () => {
            const objId = "1234" as unknown as ObjectId

            jest.spyOn(productRepoMock, 'create').mockResolvedValueOnce({ insertedId: objId, acknowledged: true })

            jest.spyOn(fs, 'createWriteStream').mockReturnValueOnce({
                write: (buf: any, cb: any) => {
                    return cb(new Error("some-error"))
                }
            } as unknown as fs.WriteStream)

            const mockFile = {
                originalname: 'test.jpg',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;


            const createProductDto = {
                name: 'Test Product',
                description: 'Test Description',
                price: '100',
                models: [],
                status: '1'
            };
            const result = service.createProduct(createProductDto, mockFile)

            expect(result).rejects.toThrow(BadRequestException)
            expect(result).rejects.toThrow("Error During Upload.")
        })
    })

})