import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { BlogCategoryEntity } from './blogCategory.entity';
import { BlogCategoryController } from './blogCategory.controller';
import { BlogCategoryService } from './blogCategory.service';
import { AdminAuthMiddleware } from '../middlewares/auth.admin.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategoryEntity, AdminEntity])],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService, AdminService],
})
export class BlogCategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
