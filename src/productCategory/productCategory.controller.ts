import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  Get,
  Delete,
  Param,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';
import { CreateProductCategoryDto } from './dto/productCategory.dto';
import { ProductCategoriesResponseInterface } from './types/productCategoriesResponse.interface';
import { ProductCategoryService } from './productCategory.service';
import { ProductCategoryResponseInterface } from './types/productCategoryResponse.interface';
import { UpdateProductCategoryDto } from './dto/updateProductCategory.dto';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { multerConfig } from 'src/middlewares/multer.middleware';

@Controller('product/category')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @Post('add')
  @UsePipes(new BackendValidationPipe())
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async addCategory(
    @Admin() admin: AdminEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() categoryDto: CreateProductCategoryDto,
  ) {
    const category = await this.categoryService.addCategory(
      categoryDto,
      admin,
      files,
    );
    return this.categoryService.buildCategoryResponse(category);
  }

  @Get('list')
  async getListOfCategories(
    @Query() query: any,
  ): Promise<ProductCategoriesResponseInterface> {
    return this.categoryService.getListOfCategories(query);
  }

  @Get('tree_cat')
  @UseGuards(AdminAuthGuard)
  async reIndexTreeCategory(@Admin() admin: AdminEntity) {
    return await this.categoryService.reIndexTreeCategory(admin);
  }

  @Get('is_last')
  @UseGuards(AdminAuthGuard)
  async setLast(@Admin() admin: AdminEntity) {
    return await this.categoryService.setLast(admin);
  }

  @Get(':id')
  async getOneCategoryWithID(
    @Param('id') id: number,
  ): Promise<ProductCategoryResponseInterface> {
    const blog = await this.categoryService.getOneCategory(id);
    return await this.categoryService.buildCategoryResponse(blog);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteCategoryWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{ message: string }> {
    return await this.categoryService.deleteCategory(id, admin);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneCategoryWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateCategoryDto: UpdateProductCategoryDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ProductCategoryResponseInterface> {
    const category = await this.categoryService.updateCategory(
      id,
      admin,
      updateCategoryDto,
      files,
    );
    return await this.categoryService.buildCategoryResponse(category);
  }
}
