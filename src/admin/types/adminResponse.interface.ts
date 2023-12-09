import { AdminType } from './admin.types';

export interface AdminResponseInterface {
  admin: AdminType & { adminToken: string };
}
