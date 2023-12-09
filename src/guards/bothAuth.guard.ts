import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressBothRequest } from 'src/types/expressRequest.interface copy';

@Injectable()
export class AuthBothGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ExpressBothRequest>();
    let token: any;
    if (request.headers.token) {
      token = request.headers.token;
    } else if (request.headers.admintoken) {
      token = request.headers.admintoken;
    }

    if (token) return true;
    throw new HttpException('شما مجاز نیستید', HttpStatus.UNAUTHORIZED);
  }
}
