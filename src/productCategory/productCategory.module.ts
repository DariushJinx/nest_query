import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { ProductCategoryEntity } from './productCategory.entity';
import { ProductCategoryController } from './productCategory.controller';
import { ProductCategoryService } from './productCategory.service';
import { AdminAuthMiddleware } from '../middlewares/auth.admin.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategoryEntity, AdminEntity])],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, AdminService],
})
export class ProductCategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
