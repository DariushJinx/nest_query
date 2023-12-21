import { chapterType } from './chapter.type';

export interface ChaptersResponseInterface {
  chapters: chapterType[];
  chaptersCount: number;
}
