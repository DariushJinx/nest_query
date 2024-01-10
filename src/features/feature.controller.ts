import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  Put,
} from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/createFeature.dto';
import { FeatureResponseInterface } from './types/featureResponse.interface';
import { FeaturesResponseInterface } from './types/featuresResponse.interface';
import { UpdateFeatureDto } from './dto/updateFeature.dto';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createFeature(
    @Admin() admin: AdminEntity,
    @Body() createFeatureDto: CreateFeatureDto,
  ) {
    const feature = await this.featureService.createFeature(
      admin,
      createFeatureDto,
    );
    return await this.featureService.buildFeatureResponse(feature);
  }

  @Get('list')
  async findAllFeatures(): Promise<FeaturesResponseInterface> {
    return await this.featureService.findAllFeatures();
  }

  @Get(':id')
  async getOneFeature(
    @Param('id') id: number,
  ): Promise<FeatureResponseInterface> {
    const feature = await this.featureService.getOneFeatureWithID(id);
    return await this.featureService.buildFeatureResponse(feature);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneFeature(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{ message: string }> {
    await this.featureService.deleteOneFeatureWithId(id, admin);

    return {
      message: 'ویژگی محصول مورد نظر با موفقیت حذف گردید',
    };
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneFeatureWithId(
    @Param('id') id: number,
    @Body('') updateFeatureDto: UpdateFeatureDto,
    @Admin() admin: AdminEntity,
  ): Promise<FeatureResponseInterface> {
    const feature = await this.featureService.updateFeature(
      id,
      updateFeatureDto,
      admin,
    );
    return await this.featureService.buildFeatureResponse(feature);
  }
}
