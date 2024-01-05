import { commentType } from './comment.type';

export interface CommentsResponseInterface {
  comments: commentType[];
  commentsCount: number;
}
