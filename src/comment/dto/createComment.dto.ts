import { Expose } from 'class-transformer';
import { IsDefined, IsOptional } from 'class-validator';
export class CreateCommentDto {
  @IsDefined()
  @Expose()
  comment: string;
  @Expose()
  @IsOptional()
  blog_id?: number;
  @Expose()
  @IsOptional()
  product_id?: number;
  @Expose()
  @IsOptional()
  course_id?: number;
  @IsOptional()
  @Expose()
  score: number;
  @IsOptional()
  @Expose()
  parent: number;
  @IsOptional()
  @Expose()
  tree_comment: string[];
}
