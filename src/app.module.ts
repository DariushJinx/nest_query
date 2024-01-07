import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ormconfig from './ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { BlogCategoryModule } from './blogCategory/blogCategory.module';
import { BlogModule } from './blog/blog.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { CourseCategoryModule } from './courseCategory/courseCategory.module';
import { CourseModule } from './course/course.module';
import { ChapterModule } from './chapter/chapter.module';
import { EpisodeModule } from './episode/episode.module';
import { ProductCategoryModule } from './productCategory/productCategory.module';
import { ProductModule } from './product/product.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormconfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UserModule,
    AdminModule,
    BlogCategoryModule,
    BlogModule,
    CourseCategoryModule,
    CourseModule,
    ChapterModule,
    EpisodeModule,
    ProductCategoryModule,
    ProductModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
