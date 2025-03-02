import { SetMetadata } from '@nestjs/common';

export const AuthTokne = 'isAuth';
export const IsAuth = () => SetMetadata(AuthTokne, true);
