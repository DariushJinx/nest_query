import { Allow } from 'class-validator';

export class UpdateBlogDto {
  readonly title: string;
  readonly short_title: string;
  readonly text: string;
  readonly short_text: string;
  readonly tags?: string[];
  readonly filename?: string;
  @Allow()
  readonly fileUploadPath: string;
}
