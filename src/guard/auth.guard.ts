import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { AuthToken } from 'src/decorator/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    const isAuthMeta = this.reflector.getAllAndOverride(AuthToken, [
      ctx.getClass(),
      ctx.getHandler(),
    ]);

    if (!isAuthMeta || req.session.user) return true;

    throw new UnauthorizedException("this route is acceesible for admin.")
  }
}


declare module 'express-session' {
  interface SessionData {
    user: { id: ObjectId, username: string };
  }
}