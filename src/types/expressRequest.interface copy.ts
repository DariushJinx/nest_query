import { Request } from 'express';
import { UserEntity } from '../user/user.entity';
import { AdminEntity } from '../admin/admin.entity';

export interface ExpressBothRequest extends Request {
  user?: UserEntity;
  admin?: AdminEntity;
}
