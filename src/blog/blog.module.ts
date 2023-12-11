import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './blog.entity';
import { UserEntity } from '../user/user.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';
import { AdminAuthMiddleware } from '../middlewares/auth.admin.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogEntity,
      UserEntity,
      AdminEntity,
      BlogCategoryEntity,
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService, AdminService],
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
