import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccessTokenPayload } from '../interface/accessToken.interface';
import { ObjectId } from 'mongodb';
import { AuthToken } from '../decorator/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private jwtService: JwtService) { }

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    const isAuthMeta = this.reflector.getAllAndOverride(AuthToken, [
      ctx.getClass(),
      ctx.getHandler(),
    ]) || null;

    if (!isAuthMeta)
      return true;

    // TODO: Validate User With Bearer Header
    const token = this.getBearerHeader(req);

    try {

      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: process.env.ACCESS_TOKEN_SECRET
      })

      req.user = {
        id: payload.id,
        username: payload.username
      }

      return true;
    } catch (err) {
      throw new UnauthorizedException("Token is invalid. please login again")
    }

  }


  private getBearerHeader(req: Request) {
    const [_, token] = req.headers.authorization?.split(' ') || []

    if (!token) {
      throw new ForbiddenException("Header is empty or doest not contain 'Bearer'")
    }

    return token;
  }
}


declare global {
  namespace Express {
    interface Request {
      user: {
        id: ObjectId,
        username: string
      }
    }
  }
}
