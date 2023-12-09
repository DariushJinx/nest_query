import { Request } from 'express';
import { AdminEntity } from '../admin/admin.entity';

export interface ExpressAdminRequest extends Request {
  admin?: AdminEntity;
}
