import { Allow } from 'class-validator';

export class UpdateEpisodeDto {
  readonly title: string;
  readonly text: string;
  readonly type: string;
  readonly chapter_id: number;
  filename: string;
  @Allow()
  fileUploadPath: string;
}
