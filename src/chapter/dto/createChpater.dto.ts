import { Expose } from 'class-transformer';
import { IsDefined, Length } from 'class-validator';

export class CreateChapterDto {
  @IsDefined({ message: 'عنوان فصل یافت نشد' })
  @Expose()
  @Length(3, 30, { message: 'عنوان وارد شده صحیح نمی باشد' })
  title: string;
  @IsDefined({ message: 'متن فصل یافت نشد' })
  @Expose()
  text: string;
  @IsDefined({ message: 'آیدی درس مورد نظر یافت نشد' })
  @Expose()
  course_id: number;
}
