import { Expose } from 'class-transformer';
import { IsDefined, Matches, Length, Allow, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsDefined({ message: 'عنوان دوره یافت نشد' })
  @Expose()
  @Length(3, 30, { message: 'عنوان وارد شده صحیح نمی باشد' })
  title: string;
  @IsDefined({ message: 'عنوان کوتاه دوره یافت نشد' })
  @Expose()
  @Length(3, 20, { message: 'عنوان کوتاه وارد شده صحیح نمی باشد' })
  short_title: string;
  @IsDefined({ message: 'متن دوره یافت نشد' })
  @Expose()
  text: string;
  @IsDefined({ message: 'متن کوتاه دوره یافت نشد' })
  @Expose()
  short_text: string;
  @IsOptional()
  @Expose()
  tags: string[];
  @IsDefined({ message: 'آیدی دسته بندی دوره یافت نشد' })
  @Expose()
  category: string;
  @IsDefined({ message: 'قیمت وارد شده صحیح نمی باشد' })
  @Expose()
  price: number;
  @IsDefined({ message: 'تخفیف وارد شده صحیح نمیباشد' })
  @Expose()
  discount: number;
  @IsDefined({ message: 'نوع دوره یافت نشد' })
  @Expose()
  @Matches(/(free|cash|special)/i, { message: 'نوع دوره صحیح نمی باشد' })
  type: string;
  @Expose()
  @Matches(/(\.png|\.jpg|\.webp|\.jpeg|\.gif)$/, {
    message: 'تصویر ارسال شده صحیح نمیباشد',
  })
  filename: string;
  @Allow()
  fileUploadPath: string;
}
