import { Test } from "@nestjs/testing"
import { UserService } from "../user.service"
import { UserRepository } from "../user.repository"



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
})