import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ProductEntity } from '../product/product.entity';
import { BlogEntity } from '../blog/blog.entity';
import { CommentEntity } from './comment.entity';
import { CourseEntity } from '../course/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentEntity,
      UserEntity,
      CourseEntity,
      ProductEntity,
      BlogEntity,
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
