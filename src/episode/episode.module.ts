import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { EpisodeEntity } from './episode.entity';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';

import { AdminService } from '../admin/admin.service';
import { AdminEntity } from '../admin/admin.entity';
import { CourseEntity } from '../course/course.entity';
import { ChapterEntity } from '../chapter/chapter.entity';
import { AdminAuthMiddleware } from '../middlewares/auth.admin.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EpisodeEntity,
      UserEntity,
      CourseEntity,
      ChapterEntity,
      AdminEntity,
    ]),
  ],
  controllers: [EpisodeController],
  providers: [EpisodeService, AdminService],
})
export class EpisodeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
