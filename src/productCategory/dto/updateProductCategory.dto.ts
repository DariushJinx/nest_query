import { Allow } from 'class-validator';
export class UpdateProductCategoryDto {
  title: string;
  filename: string;
  @Allow()
  fileUploadPath: string;
}
