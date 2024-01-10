import { Expose } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class CreateFeatureDto {
  @IsDefined({ message: 'موضوع ویژگی یافت نشد' })
  @Expose()
  title: string;
  @IsDefined({ message: 'توضیحات ویژگی یافت نشد' })
  @Expose()
  description: string;
  @IsDefined({ message: 'آیدی محصول مورد نظر یافت نشد' })
  @Expose()
  product_id: number;
}
