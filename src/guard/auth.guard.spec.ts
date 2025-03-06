import { Test } from "@nestjs/testing"
import { JsonWebTokenError, JwtService } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";

describe("Auth Guard", () => {
    let guard: AuthGuard;

    let mockExecutionContext = {
        switchToHttp: jest.fn(),
        getClass: jest.fn(),
        getHandler: jest.fn(),
    }

    let jwtMock: Partial<JwtService> = {
        verifyAsync: jest.fn()
    }

    let reflectorMock: Partial<Reflector> = {
        getAllAndOverride: jest.fn()
    }


    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: JwtService,
                    useValue: jwtMock
                },
                AuthGuard,
                {
                    provide: Reflector,
                    useValue: reflectorMock
                }
            ]
        }).compile()


        guard = module.get(AuthGuard)
    })


    it("Should be defined", () => {
        expect(guard).toBeDefined()
    })


    describe("Header", () => {
        it("should be throw An Error If Header is Empty and Route requires Authentication", () => {
            jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue([true])

            mockExecutionContext.switchToHttp.mockReturnValue({
                getRequest: () => ({ headers: { authorization: "" } })
            })
            jest.spyOn(mockExecutionContext, 'getClass').mockResolvedValue(true)
            jest.spyOn(mockExecutionContext, 'getHandler').mockResolvedValue(true)

            expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(ForbiddenException)
            expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow("Header is empty or doest not contain 'Bearer'")
        })


        it("Should be return true if route is free", () => {
            jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(null)

            mockExecutionContext.switchToHttp.mockReturnValue({
                getRequest: () => ({ headers: { authorization: "" } })
            })
            jest.spyOn(mockExecutionContext, 'getClass').mockResolvedValue(true)
            jest.spyOn(mockExecutionContext, 'getHandler').mockResolvedValue(true)

            expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).resolves.toEqual(true)
        })

        it("Should be throw UnAuthorized if Token is invalid", () => {
            jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(true)

            jest.spyOn(jwtMock, 'verifyAsync').mockRejectedValue(new JsonWebTokenError("invalid token"))

            mockExecutionContext.switchToHttp.mockReturnValue({
                getRequest: () => ({ headers: { authorization: "Bearer invalid-token" } })
            })

            jest.spyOn(mockExecutionContext, 'getClass').mockResolvedValue(true)
            jest.spyOn(mockExecutionContext, 'getHandler').mockResolvedValue(true)

            expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(UnauthorizedException)
            expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow("Token is invalid. please login")
        })
        it("Should be return true if Token is valid and route is required authentication", () => {
            jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(true)

            jest.spyOn(jwtMock, 'verifyAsync').mockResolvedValue({})

            mockExecutionContext.switchToHttp.mockReturnValue({
                getRequest: () => ({ headers: { authorization: "Bearer valid-token" } })
            })

            jest.spyOn(mockExecutionContext, 'getClass').mockResolvedValue(true)
            jest.spyOn(mockExecutionContext, 'getHandler').mockResolvedValue(true)

            expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).resolves.toEqual(true)
        })
    })

})