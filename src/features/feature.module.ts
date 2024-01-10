import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureEntity } from './feature.entity';
import { FeatureController } from './feature.controller';
import { UserEntity } from '../user/user.entity';
import { FeatureService } from './feature.service';
import { ProductEntity } from '../product/product.entity';
import { AdminEntity } from '../admin/admin.entity';
import { AdminService } from '../admin/admin.service';
import { AdminAuthMiddleware } from 'src/middlewares/auth.admin.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeatureEntity,
      UserEntity,
      ProductEntity,
      AdminEntity,
    ]),
  ],
  controllers: [FeatureController],
  providers: [FeatureService, AdminService],
})
export class FeatureModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminAuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
