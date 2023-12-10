import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { AdminService } from 'src/admin/admin.service';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';
import { ExpressAdminRequest } from 'src/types/expressAdminRequest.interface copy';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  constructor(private readonly adminService: AdminService) {}

  async use(req: ExpressAdminRequest, res: Response, next: NextFunction) {
    if (!req.headers.admintoken) {
      req.admin = null;
      next();
      return;
    }

    let token: any;
    if (req.headers && req.headers.admintoken) {
      token = req.headers.admintoken;
    }

    try {
      verify(token, ACCESS_TOKEN_SECRET_KEY, async (err: any, payload: any) => {
        try {
          if (err) {
            throw new HttpException(
              'وارد حساب کاربری خود شوید...',
              HttpStatus.UNAUTHORIZED,
            );
          } else {
            const { email } = payload;
            const admin = await this.adminService.findAdminByEmail(email);
            if (!admin) {
              throw new HttpException(
                'وارد حساب کاربری خود شوید',
                HttpStatus.UNAUTHORIZED,
              );
            }
            req.admin = admin;
            return next();
          }
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      req.admin = null;
      next(err);
    }
  }
}
