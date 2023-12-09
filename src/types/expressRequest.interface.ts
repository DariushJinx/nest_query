import { Request } from 'express';
import { UserEntity } from '../user/user.entity';

export interface ExpressRequest extends Request {
  user?: UserEntity;
}
