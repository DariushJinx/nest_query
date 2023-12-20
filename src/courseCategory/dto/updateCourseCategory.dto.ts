import { Allow } from 'class-validator';
export class UpdateCourseCategoryDto {
  title: string;
  filename: string;
  @Allow()
  fileUploadPath: string;
}
