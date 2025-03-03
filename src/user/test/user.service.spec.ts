import { Test } from "@nestjs/testing"
import { UserService } from "../user.service"
import { UserRepository } from "../user.repository"
import { ObjectId } from "mongodb"
import { ConflictException } from "@nestjs/common"
import * as bcrypt from 'bcryptjs'


describe("User Service Testing", () => {

    let userRepositoryMock: Partial<UserRepository> = {
        create: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
    }

    let service: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: userRepositoryMock
                }
            ]
        }).compile();

        service = module.get(UserService);
    })


    it("Should be Defined", () => {
        expect(service).toBeDefined()
        expect(userRepositoryMock).toBeDefined()
    })


    describe("Register User", () => {
        it("should be thorw an Error because username is exsist before.", () => {
            jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce({ _id: "id" as unknown as ObjectId, username: "test", password: "testPass" })


            const promise = service.createUser({ username: "test", 'password': "12341234" })

            expect(promise).rejects.toThrow(ConflictException)
            expect(promise).rejects.toThrow("username is exsist before.")
        })

        it("shoulds be registered user", async () => {
            jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce(null)
            jest.spyOn(userRepositoryMock, 'create').mockResolvedValueOnce({ acknowledged: true, insertedId: "id" as unknown as ObjectId })
            jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce("hash-pass" as never)
            jest.spyOn(bcrypt, 'genSalt').mockResolvedValueOnce("new-salt" as never)

            const promise = service.createUser({ password: "new-pass", username: "new-username" })

            await expect(promise).resolves.toEqual({ msg: "user created successfully", id: "id" })

            expect(bcrypt.hash).toHaveBeenCalled()
            expect(bcrypt.hash).toHaveBeenCalledWith("new-pass", 'new-salt')
            expect(userRepositoryMock.create).toHaveBeenCalledWith({
                password: "hash-pass",
                username: "new-username"
            })
        })
    })
    describe("Login User", () => { })
})