import { ChapterEntity } from '../chapter.entity';

export type chapterType = Omit<ChapterEntity, 'updateTimeStamp'>;
