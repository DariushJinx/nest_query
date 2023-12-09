import { AdminEntity } from '../admin.entity';

export type AdminType = Omit<AdminEntity, 'hashPassword'>;
