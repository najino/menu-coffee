import { SetMetadata } from '@nestjs/common';

export const AuthToken = 'isAuth';
export const IsAuth = () => SetMetadata(AuthToken, true);
