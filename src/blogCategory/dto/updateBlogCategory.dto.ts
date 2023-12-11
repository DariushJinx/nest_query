import { Allow } from 'class-validator';
export class UpdateBlogCategoryDto {
  title: string;
  filename: string;
  @Allow()
  fileUploadPath: string;
}
