import { Test } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { ProductRepository } from '../product.repository';
import {
  FindCursor,
  ObjectId,
  WithId,
} from 'mongodb';
import * as fs from 'fs';
import Decimal from 'decimal.js';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entity/product.entity';
import { Readable } from 'stream';
import * as sharp from 'sharp';

describe('Product Service', () => {
  let service: ProductService;
  let products: Product[] = [];
  const productRepoMock = {
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: productRepoMock,
        },
      ],
    }).compile();

    service = module.get(ProductService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Product', () => {
    it('should be create Product', async () => {
      const objId = '1234' as unknown as ObjectId;

      // mock Readable
      jest.spyOn(Readable, 'from').mockImplementation(
        () =>
          ({
            pipe: jest.fn().mockReturnValue({
              on: jest.fn(),
            }),
          }) as unknown as Readable,
      );

      jest.spyOn(sharp.prototype, 'resize').mockReturnValue({
        toBuffer: jest.fn().mockResolvedValueOnce(Buffer.from('mock')),
      } as unknown as sharp.Sharp);

      jest
        .spyOn(productRepoMock, 'create')
        .mockResolvedValueOnce({ insertedId: objId, acknowledged: true });

      jest.spyOn(fs, 'createWriteStream').mockReturnValue({
        write: () => {
          return true;
        },
      } as unknown as fs.WriteStream);

      jest.spyOn(productRepoMock, 'findOne').mockResolvedValueOnce({
        _id: objId,
        description: 'Test Description',
        img: 'path',
        models: [],
        name: 'Test Product',
        price: '100',
        status: true,
      });

      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100',
        models: [],
        status: '1',
      };

      const result = await service.createProduct(createProductDto, mockFile);

      expect(productRepoMock.findOne).toHaveBeenCalledWith({ _id: objId });

      expect(fs.createWriteStream).toHaveBeenCalled();

      expect(result).toEqual({
        _id: '1234',
        name: 'Test Product',
        description: 'Test Description',
        img: 'path',
        price: new Decimal(100).valueOf(),
        models: [],
        status: true,
      });
      expect(sharp.prototype.resize).toHaveBeenCalledWith(200, 200);
    });

    it('should throw InternalServerErrorException if repository fails', async () => {
      productRepoMock.create.mockRejectedValue(new Error('DB error'));

      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100',
        models: [],
        status: '1',
      };

      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      expect(service.createProduct(createProductDto, mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('Should throw BadRequest if has Error During UploadFile', () => {
      const objId = '1234' as unknown as ObjectId;
      // mock Readable
      jest.spyOn(Readable, 'from').mockImplementation(
        () =>
          ({
            pipe: jest.fn().mockReturnValue({
              on: jest.fn().mockImplementation((err, cb) => {
                if (err === 'error') {
                  cb(new Error('some error'));
                }
              }),
            }),
          }) as unknown as Readable,
      );

      jest.spyOn(sharp.prototype, 'resize').mockReturnValue({
        toBuffer: jest.fn().mockResolvedValueOnce(Buffer.from('mock')),
      } as unknown as sharp.Sharp);

      jest
        .spyOn(productRepoMock, 'create')
        .mockResolvedValueOnce({ insertedId: objId, acknowledged: true });

      jest.spyOn(fs, 'createWriteStream').mockReturnValueOnce({
        write: (buf: any, cb: any) => {
          return cb(new Error('some-error'));
        },
      } as unknown as fs.WriteStream);

      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100',
        models: [],
        status: '1',
      };
      const result = service.createProduct(createProductDto, mockFile);

      expect(result).rejects.toThrow(BadRequestException);
      expect(result).rejects.toThrow('Error During Upload.');
    });
  });

  describe('findAll', () => {
    beforeAll(async () => {
      productRepoMock.findAll.mockImplementation(
        (where: any, options: any) =>
          products as unknown as FindCursor<WithId<Product>>,
      );

      for (let i = 1; i <= 10; i++) {
        const productFake: Product = {
          description: `Test Description ${i}`,
          img: `imageFake${i}`,
          models: [],
          name: `fake name${i}`,
          price: '12000',
          status: true,
        };
        products.push(productFake);
      }
    });

    it('FindAll', async () => {
      const result = await service.findAll();
      expect(result.length).toEqual(10);
      expect(productRepoMock.findAll).toHaveBeenCalledWith(
        {},
        { limit: 10, skip: 0 },
      );
    });

    it('FindAll With Limit 5', async () => {
      const result = await service.findAll(5);
      expect(result.length).toEqual(10);
      expect(productRepoMock.findAll).toHaveBeenCalledWith(
        {},
        { limit: 5, skip: 0 },
      );
    });

    it('FindAll With Limit 5 and page 2', async () => {
      const result = await service.findAll(5, 2);
      const skip = (2 - 1) * 5;
      expect(result.length).toEqual(10);
      expect(productRepoMock.findAll).toHaveBeenCalledWith(
        {},
        { limit: 5, skip: skip },
      );
    });
  });

  describe('Update', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('Should be throw NotFoundException Because Product Not Found', () => {
      jest
        .spyOn(productRepoMock, 'update')
        .mockImplementationOnce((_: any, payload: any) => payload);

      jest.spyOn(productRepoMock, 'findOne').mockResolvedValueOnce(null);

      const objId = ObjectIdGenerator() as unknown as ObjectId;

      const promise = service.update(objId, {});
      expect(promise).rejects.toThrow(NotFoundException);
      expect(promise).rejects.toThrow('Product not found.');
    });

    it('should be updated without img', async () => {
      jest
        .spyOn(productRepoMock, 'update')
        .mockImplementationOnce((id: any, payload: any) =>
          Promise.resolve(payload),
        );

      jest.spyOn(productRepoMock, 'findOne').mockResolvedValue({});

      const objId = ObjectIdGenerator() as unknown as ObjectId;

      const res = await service.update(objId, { status: '1', price: '120000' });

      expect(res).toEqual({ status: true, price: '120000' });

      expect(productRepoMock.update).toHaveBeenCalledTimes(1);
    });

    it('should be updated with image', async () => {
      jest.spyOn(fs, 'createWriteStream').mockReturnValue({
        write: () => {
          return true;
        },
      } as unknown as fs.WriteStream);

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'rmSync').mockReturnValue();

      // mock Readable
      jest.spyOn(Readable, 'from').mockImplementation(
        () =>
          ({
            pipe: jest.fn().mockReturnValue({
              on: jest.fn(),
            }),
          }) as unknown as Readable,
      );

      jest.spyOn(sharp.prototype, 'resize').mockReturnValue({
        toBuffer: jest.fn().mockResolvedValueOnce(Buffer.from('mock')),
      } as unknown as sharp.Sharp);

      const mockProduct = {
        img: 'path',
      };

      jest.spyOn(productRepoMock, 'findOne').mockResolvedValueOnce(mockProduct);

      jest.spyOn(productRepoMock, 'update').mockResolvedValueOnce(mockProduct);

      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const objId = ObjectIdGenerator() as unknown as ObjectId;

      const res = await service.update(objId, {}, mockFile);

      expect(res).toHaveProperty('img');

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.rmSync).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalled();
    });
  });

  describe('Remove Product', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Should be throw NotFoundException', () => {
      productRepoMock.delete.mockResolvedValueOnce(null);
      const objId = ObjectIdGenerator() as unknown as ObjectId;
      const promise = service.remove(objId);
      expect(promise).rejects.toThrow(NotFoundException);
      expect(promise).rejects.toThrow('Product not found.');
    });

    it('Should be removed successful', async () => {
      const objId = ObjectIdGenerator() as unknown as ObjectId;
      productRepoMock.delete.mockResolvedValueOnce({
        _id: objId,
        img: '/public/product/test.jpg',
      });
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
      jest.spyOn(fs, 'rmSync').mockReturnValueOnce();

      const res = await service.remove(objId);
      expect(res).toEqual({ _id: objId, img: '/public/product/test.jpg' });
      expect(fs.existsSync).toHaveBeenCalledWith(`${process.cwd()}${res.img}`);
      expect(fs.rmSync).toHaveBeenCalled();
    });
  });
});

const ObjectIdGenerator = (
  m = Math,
  d = Date,
  h = 16,
  s = (s) => m.floor(s).toString(h),
) => s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
