import { Allow } from 'class-validator';

export class UpdateCourseDto {
  readonly title: string;
  readonly short_title: string;
  readonly text: string;
  readonly short_text: string;
  readonly tags: string[];
  readonly price: number;
  readonly discount: number;
  readonly type: string;
  readonly filename: string;
  @Allow()
  readonly fileUploadPath: string;
}
