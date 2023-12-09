import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ExpressRequest } from 'src/types/expressRequest.interface';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    if (!req.headers.token) {
      req.user = null;
      next();
      return;
    }

    let token: any;
    if (req.headers && req.headers.token) {
      token = req.headers.token;
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
            const user = await this.userService.findByEmail(email);
            if (!user) {
              throw new HttpException(
                'وارد حساب کاربری خود شوید...',
                HttpStatus.UNAUTHORIZED,
              );
            }
            req.user = user;
            return next();
          }
        } catch (err) {
          next(err);
        }
      });
    } catch (err) {
      req.user = null;
      next(err);
    }
  }
}
