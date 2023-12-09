import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExpressAdminRequest } from 'src/types/expressAdminRequest.interface copy';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ExpressAdminRequest>();

    if (request.headers.admintoken) {
      return true;
    }
    throw new HttpException('شما مجاز نیستید', HttpStatus.UNAUTHORIZED);
  }
}
