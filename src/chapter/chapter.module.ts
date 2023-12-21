import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { ChapterService } from './chpater.service';
import { ChapterController } from './chapter.controller';
import { AdminService } from '../admin/admin.service';
import { AdminEntity } from '../admin/admin.entity';
import { ChapterEntity } from './chapter.entity';
import { CourseEntity } from 'src/course/course.entity';
import { EpisodeEntity } from 'src/episode/episode.entity';
import { AdminAuthMiddleware } from 'src/middlewares/auth.admin.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChapterEntity,
      UserEntity,
      CourseEntity,
      EpisodeEntity,
      AdminEntity,
    ]),
  ],
  controllers: [ChapterController],
  providers: [ChapterService, AdminService],
})
export class ChapterModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
