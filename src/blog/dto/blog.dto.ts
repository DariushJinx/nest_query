import { Expose } from 'class-transformer';
import { IsDefined, Matches, Length, Allow, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @IsDefined({ message: 'عنوان مقاله ارسالی یافت نشد' })
  @Expose()
  @Length(3, 100, { message: 'عنوان مقاله ارسالی صحیح نمی باشد' })
  title: string;
  @IsDefined({ message: 'متن مقاله ارسالی صحیح نمی باشد' })
  @Expose()
  text: string;
  @IsDefined({ message: 'متن کوتاه مقاله ارسالی صحیح نمی باشد' })
  @Expose()
  short_text: string;
  @IsOptional()
  @Expose()
  tags?: string[];
  @IsDefined({ message: 'آیدی دسته بندی مقاله یافت نشد' })
  @Expose()
  category: string;
  @IsOptional()
  @Expose()
  tree_blog: string[];
  @IsOptional()
  @Expose()
  @Matches(/(\.png|\.jpg|\.webp|\.jpeg|\.gif)$/, {
    message: 'تصویر ارسال شده صحیح نمیباشد',
  })
  filename?: string;
  @Allow()
  fileUploadPath: string;
}
