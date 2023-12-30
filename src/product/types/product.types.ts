import { ProductEntity } from '../product.entity';

export type productType = Omit<ProductEntity, 'updateTimeStamp'>;
