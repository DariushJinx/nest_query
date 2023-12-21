import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { CourseEntity } from './course.entity';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseCategoryEntity } from '../courseCategory/CourseCategory.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { ChapterEntity } from '../chapter/chapter.entity';
import { AdminAuthMiddleware } from 'src/middlewares/auth.admin.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      UserEntity,
      ChapterEntity,
      CourseCategoryEntity,
      AdminEntity,
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService, AdminService],
})
export class CourseModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
