import { Expose } from 'class-transformer';
import { IsDefined, Matches, Length, Allow, IsOptional } from 'class-validator';
export class CreateProductCategoryDto {
  @IsDefined()
  @Expose()
  @Length(3, 30, { message: 'عنوان دسته بندی وارد شده صحیح نمی باشد' })
  title: string;
  @IsOptional()
  @Expose()
  parent: number;
  @IsOptional()
  @Expose()
  tree_cat: string[];
  @Expose()
  @IsOptional()
  @Matches(/(\.png|\.jpg|\.webp|\.jpeg|\.gif)$/, {
    message: 'فرمت عکس ارسالی صحیح نمی باشد',
  })
  filename: string;
  @Allow()
  fileUploadPath: string;
}
