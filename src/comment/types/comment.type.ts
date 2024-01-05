import { CommentEntity } from '../comment.entity';

export type commentType = Omit<CommentEntity, 'updateTimeStamp'>;
