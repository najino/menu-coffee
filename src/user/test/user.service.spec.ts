import { Test } from "@nestjs/testing"
import { UserService } from "../user.service"
import { UserRepository } from "../user.repository"
import { ObjectId } from "mongodb"
import { ConflictException, NotFoundException } from "@nestjs/common"
import * as bcrypt from 'bcryptjs'
import { JwtModule, JwtService } from "@nestjs/jwt"


describe("User Service Testing", () => {

    let userRepositoryMock: Partial<UserRepository> = {
        create: jest.fn(),
        delete: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn()
    }

    let jwtMock: Partial<JwtService> = {
        signAsync: jest.fn()
    }

    let service: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: userRepositoryMock
                },
                {
                    provide: JwtService,
                    useValue: jwtMock
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
        it("should be throw an Error because username is exist before.", () => {
            jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce({ _id: "id" as unknown as ObjectId, username: "test", password: "testPass" })


            const promise = service.createUser({ username: "test", 'password': "12341234" })

            expect(promise).rejects.toThrow(ConflictException)
            expect(promise).rejects.toThrow("username is exist before.")
        })

        it("should be registered user", async () => {
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
    describe("Login User", () => {
        it("should be throw An Error If User Does not found", () => {
            jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce(null)

            const promise = service.login({ username: "username", password: "pass" })
            expect(promise).rejects.toThrow(NotFoundException)
            expect(promise).rejects.toThrow("invalid credential.")
        })


        it("should be throw an Error If Credentials are invalid", () => {
            let user = {
                _id: "user-id" as unknown as ObjectId,
                username: "username",
                password: "password"
            }
            jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce(user)

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never)

            const promise = service.login({ username: "username", password: "pass" })
            expect(promise).rejects.toThrow(NotFoundException)
            expect(promise).rejects.toThrow("invalid credential.")
        })


        it("should be login successful", () => {
            let user = {
                _id: "user-id" as unknown as ObjectId,
                username: "username",
                password: "password"
            }
            jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce(user)

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never)
            jest.spyOn(jwtMock, 'signAsync').mockResolvedValueOnce("accessToken")

            const promise = service.login({ username: "username", password: "pass" })

            expect(promise).resolves.toHaveProperty('msg')
            expect(promise).resolves.toHaveProperty('accessToken')
        })
    })
})