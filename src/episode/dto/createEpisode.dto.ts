import { Expose } from 'class-transformer';
import { Allow, IsDefined, Length, Matches } from 'class-validator';

export class CreateEpisodeDto {
  @IsDefined({ message: 'عنوان قسمت یافت نشد' })
  @Expose()
  @Length(3, 30, { message: 'عنوان وارد شده صحیح نمی باشد' })
  title: string;
  @IsDefined({ message: 'متن قسمت یافت نشد' })
  @Expose()
  text: string;
  @IsDefined({ message: 'آیدی فصل مورد نظر یافت نشد' })
  @Expose()
  chapter_id: number;
  @IsDefined({ message: 'نوع قسمت یافت نشد' })
  @Expose()
  @Matches(/(lock|unlock)/i, { message: 'نوع قسمت صحیح نمی باشد' })
  type: string;
  @IsDefined({ message: 'ویدیو ارسالی صحیح نمی باشد' })
  @Expose()
  @Matches(/(\.mp4|\.mov|\.mkv|\.mpg)$/, {
    message: 'ویدیو ارسال شده صحیح نمیباشد',
  })
  filename: string;
  @Allow()
  fileUploadPath: string;
}
