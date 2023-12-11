import { BlogEntity } from '../blog.entity';

export type blogType = Omit<BlogEntity, 'updateTimeStamp'>;
