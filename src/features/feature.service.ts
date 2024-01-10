import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { FeatureEntity } from './feature.entity';
import { ProductEntity } from '../product/product.entity';
import { CreateFeatureDto } from './dto/createFeature.dto';
import { FeatureResponseInterface } from './types/featureResponse.interface';
import { FeaturesResponseInterface } from './types/featuresResponse.interface';
import { UpdateFeatureDto } from './dto/updateFeature.dto';
import { AdminEntity } from '../admin/admin.entity';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async createFeature(
    admin: AdminEntity,
    createFeatureDto: CreateFeatureDto,
  ): Promise<FeatureEntity> {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['error'] =
        'شما مجاز به ثبت ویژگی برای محصولات نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const checkExistsProduct = await this.productRepository.findOne({
      where: { id: Number(createFeatureDto.product_id) },
    });

    if (!checkExistsProduct) {
      errorResponse.errors['product'] = 'محصول مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }

    const feature = new FeatureEntity();
    Object.assign(feature, createFeatureDto);
    return await this.featureRepository.save(feature);
  }

  async getOneFeatureWithID(id: number): Promise<FeatureEntity> {
    const feature = await this.featureRepository.findOne({
      where: { id: id },
    });

    if (!feature) {
      throw new HttpException('ویژگی مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    delete feature.product_id;

    return feature;
  }

  async buildFeatureResponse(
    feature: FeatureEntity,
  ): Promise<FeatureResponseInterface> {
    return { feature };
  }

  async deleteOneFeatureWithId(
    id: number,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف ویژگی محصولات نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const feature = await this.getOneFeatureWithID(id);
    if (!feature) {
      throw new HttpException('ویژگی مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    await this.featureRepository.delete({ id });

    return {
      message: 'ویژگی محصول مورد نظر با موفقیت حذف گردید',
    };
  }

  async findAllFeatures(): Promise<FeaturesResponseInterface> {
    const queryBuilder = this.featureRepository.createQueryBuilder('features');
    const featuresCount = await queryBuilder.getCount();
    const features = await queryBuilder.getMany();
    return { features, featuresCount };
  }

  async updateFeature(
    id: number,
    updateFeatureDto: UpdateFeatureDto,
    admin: AdminEntity,
  ) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به بروزرسانی ویژگی محصولات نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const feature = await this.getOneFeatureWithID(id);

    if (!feature) {
      throw new HttpException('ویژگی مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    Object.assign(feature, updateFeatureDto);

    return await this.featureRepository.save(feature);
  }
}
