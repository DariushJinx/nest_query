import { Expose } from 'class-transformer';
import { IsDefined, Matches, Length, Allow, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsDefined({ message: 'عنوان ارسالی محصول یافت نشد' })
  @Expose()
  @Length(3, 250, { message: 'عنوان ارسالی محصول صحیح نمی باشد' })
  title: string;
  @IsDefined({ message: 'عنوان کوتاه ارسالی محصول یافت نشد' })
  @Expose()
  @Length(3, 150, { message: 'عنوان کوتاه ارسالی محصول صحیح نمی باشد' })
  short_title: string;
  @IsDefined({ message: 'متن محصول یافت نشد' })
  @Expose()
  text: string;
  @IsDefined({ message: 'متن کوتاه محصول یافت نشد' })
  @Expose()
  short_text: string;
  @IsOptional()
  @Expose()
  tags: string[];
  @IsDefined({ message: 'آیدی دسته بندی محصول یافت نشد' })
  @Expose()
  category: string;
  @IsDefined({ message: 'قیمت وارد شده صحیح نمی باشد' })
  @Expose()
  price: number;
  @IsDefined({ message: 'تخفیف وارد شده صحیح نمیباشد' })
  @Expose()
  discount: number;
  @IsDefined({ message: 'تعداد وارد شده صحیح نمیباشد' })
  @Expose()
  count: number;
  @IsOptional()
  @Expose()
  colors: string[];
  @Expose()
  @Matches(/(\.png|\.jpg|\.webp|\.jpeg|\.gif)$/, {
    message: 'تصویر ارسال شده صحیح نمیباشد',
  })
  filename: string;
  @Allow()
  fileUploadPath: string;
}
