import {
  Controller,
  Post,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  Query,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from '../decorators/user.decorators';
import { CreateProductDto } from './dto/product.dto';
import { ProductsResponseInterface } from './types/productsResponse.interface';
import { ProductResponseInterface } from './types/productResponse.interface';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthGuard } from '../guards/adminAuth.guard';
import { BackendValidationPipe } from '../pipes/backendValidation.pipe';
import { multerConfig } from '../middlewares/multer.middleware';
import { AuthGuard } from '../guards/auth.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createProduct(
    @Admin() admin: AdminEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    const product = await this.productService.createProduct(
      admin,
      createProductDto,
      files,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Get('list')
  async findAllProducts(
    @Query() query: any,
  ): Promise<ProductsResponseInterface> {
    return await this.productService.findAllProducts(query);
  }

  // @Get('all_products')
  // async findAllProductsWithRating() {
  //   return await this.productService.findAllProductsWithRating();
  // }

  @Get(':id')
  async getOneProduct(
    @Param('id') id: number,
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.currentProduct(id);
    return await this.productService.buildProductResponses(product);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneProduct(@Param('id') id: number, @Admin() admin: AdminEntity) {
    return await this.productService.deleteOneProductWithID(id, admin);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneProductWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.updateProduct(
      id,
      admin,
      updateProductDto,
      files,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Put(':productId/favorite')
  @UseGuards(AuthGuard)
  async InsertProductToFavorite(
    @Param('productId') productId: number,
    @User('id') currentUser: number,
  ): Promise<ProductResponseInterface> {
    const product = await this.productService.favoriteProduct(
      productId,
      currentUser,
    );
    return await this.productService.buildProductResponse(product);
  }

  @Delete(':productId/favorite')
  @UseGuards(AuthGuard)
  async deleteProductFromFavorite(
    @User('id') currentUser: number,
    @Param('productId') productId: number,
  ): Promise<{
    message: string;
  }> {
    await this.productService.deleteProductFromFavorite(productId, currentUser);
    return {
      message: 'محصول مورد نظر با موفقیت از لیست علاقه مندی های شما حذف گردید',
    };
  }
}
