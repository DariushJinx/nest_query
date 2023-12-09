import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { AdminService } from '../admin/admin.service';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthMiddleware } from 'src/middlewares/auth.admin.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AdminEntity])],
  controllers: [UserController],
  providers: [UserService, AdminService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
