import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './product.entity';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { ProductResponseInterface } from './types/productResponse.interface';
import { CreateProductDto } from './dto/product.dto';
import { FunctionUtils } from '../utils/functions.utils';
import { ProductsResponseInterface } from './types/productsResponse.interface';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ProductCategoryEntity } from 'src/productCategory/productCategory.entity';
import { AdminEntity } from 'src/admin/admin.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductCategoryEntity)
    private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
  ) {}

  async createProduct(
    admin: AdminEntity,
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ): Promise<ProductEntity> {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['error'] = 'شما مجاز به ثبت محصول نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const checkExistsCategory = await this.productCategoryRepository.findOne({
      where: { id: Number(createProductDto.category_id) },
    });

    if (!checkExistsCategory) {
      errorResponse.errors['category'] = 'دسته بندی مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }

    const product = new ProductEntity();
    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createProductDto.fileUploadPath,
    );
    delete createProductDto.fileUploadPath;
    delete createProductDto.filename;
    Object.assign(product, createProductDto);
    product.supplier = admin;
    product.tree_product = [];
    product.tree_product_name = [];
    delete product.supplier.password;
    product.images = images;

    const saveProduct = await this.productRepository.save(product);

    const productCategories = await this.productCategoryRepository.findOne({
      where: { id: +product.category },
    });

    productCategories.tree_cat.forEach(async (item) => {
      const category = await this.productCategoryRepository.findOne({
        where: { id: +item },
      });

      product.tree_product_name.push(category.title);
      product.tree_product = productCategories.tree_cat;
      await this.productRepository.save(product);
    });

    return await this.productRepository.save(saveProduct);
  }

  async findAllProducts(query: any): Promise<ProductsResponseInterface> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.supplier', 'supplier');

    if (query.search) {
      queryBuilder.andWhere('product.tags LIKE :search', {
        search: `%${query.search}`,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('product.tags LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.supplier) {
      const supplier = await this.userRepository.findOne({
        where: { username: query.supplier },
      });

      if (!supplier) {
        throw new HttpException(
          'محصولی با این مشخصات یافت نشد',
          HttpStatus.UNAUTHORIZED,
        );
      }

      queryBuilder.andWhere('product.supplierId = :id', {
        id: supplier.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');

    const productsCount = await queryBuilder.getCount();
    const products = await queryBuilder.getMany();

    products.forEach((product) => {
      delete product.supplier.id;
      delete product.supplier.first_name;
      delete product.supplier.last_name;
      delete product.supplier.mobile;
      delete product.supplier.is_ban;
      delete product.supplier.email;
      delete product.supplier.password;
    });

    if (!products.length) {
      throw new HttpException('هیچ محصولی یافت نشد', HttpStatus.BAD_REQUEST);
    }

    return { products, productsCount };
  }

  // async findAllProductsWithRating() {
  //   const products = await this.productRepository.find();
  //   const comments = await this.commentRepository.find({
  //     where: { show: 1 },
  //   });

  //   if (!products.length) {
  //     throw new HttpException('هیچ محصولی یافت نشد', HttpStatus.BAD_REQUEST);
  //   }

  //   const allProducts = [];

  //   products.map(async (product) => {
  //     let productTotalScore: number = 5;
  //     const productScores = comments?.filter((comment) => {
  //       if (comment.product_id) {
  //         if (comment.product_id.id.toString() === product.id.toString()) {
  //           return comment;
  //         }
  //       }
  //     });

  //     productScores.forEach((comment) => {
  //       productTotalScore += Number(comment.score);
  //     });
  //     let average = ~~(productTotalScore / (productScores.length + 1));
  //     if (average < 0) {
  //       average = 0;
  //     } else if (average > 5) {
  //       average = 5;
  //     }
  //     allProducts.push({
  //       ...product,
  //       productAverageScore: average,
  //     });

  //     products.forEach((product) => {
  //       delete product.category.images;
  //       delete product.category.register;
  //       delete product.category.parent;
  //       delete product.category.isLast;
  //       delete product.category.tree_cat;
  //       delete product.category.createdAt;
  //       delete product.category.updatedAt;
  //       delete product.supplier.first_name;
  //       delete product.supplier.last_name;
  //       delete product.supplier.mobile;
  //       delete product.supplier.is_ban;
  //       delete product.supplier.email;
  //       delete product.supplier.password;
  //     });

  //     await this.productRepository.save(allProducts);
  //   });

  //   return allProducts;
  // }

  async getOneProductWithID(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id: id },
    });

    if (!product) {
      throw new HttpException('هیچ محصولی یافت نشد', HttpStatus.BAD_REQUEST);
    }

    delete product.category.images;
    delete product.category.register;
    delete product.category.parent;
    delete product.category.is_last;
    delete product.category.tree_cat;
    delete product.category.created_at;
    delete product.category.updated_at;
    delete product.supplier.first_name;
    delete product.supplier.last_name;
    delete product.supplier.mobile;
    delete product.supplier.is_ban;
    delete product.supplier.email;
    delete product.supplier.password;

    return product;
  }

  async deleteOneProductWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف محصول نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const product = await this.getOneProductWithID(id);
    if (!product) {
      throw new HttpException('کالا مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    await this.productRepository.delete({ id });

    return {
      message: 'محصول مورد نظر با موفقیت حذف شد',
    };
  }

  async updateProduct(
    id: number,
    admin: AdminEntity,
    updateProductDto: UpdateProductDto,
    files: Express.Multer.File[],
  ) {
    const product = await this.getOneProductWithID(id);

    if (!product) {
      throw new HttpException('product does not exist', HttpStatus.NOT_FOUND);
    }

    if (!admin) {
      throw new HttpException(
        'شما مجاز به به روز رسانی محصول نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      updateProductDto.fileUploadPath,
    );

    Object.assign(product, updateProductDto);

    product.images = images;

    return await this.productRepository.save(product);
  }

  async favoriteProduct(productId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['products_bookmarks'],
    });
    const product = await this.getOneProductWithID(productId);

    const isNotFavorite =
      user.products_bookmarks.findIndex(
        (productInFavorite) => productInFavorite.id === product.id,
      ) === -1;

    if (isNotFavorite) {
      user.products_bookmarks.push(product);
      product.favorites_count++;
      await this.userRepository.save(user);
      await this.productRepository.save(product);
    }

    return product;
  }

  async deleteProductFromFavorite(productId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['products_bookmarks'],
    });
    const product = await this.getOneProductWithID(productId);

    const productIndex = user.products_bookmarks.findIndex(
      (productInFavorite) => productInFavorite.id === product.id,
    );

    if (productIndex >= 0) {
      user.products_bookmarks.splice(productIndex, 1);
      if (product.favorites_count < 0) {
        product.favorites_count = 0;
      }
      product.favorites_count--;
      await this.userRepository.save(user);
      await this.productRepository.save(product);
    }
    return product;
  }

  async currentProduct(id: number) {
    const product = await this.productRepository.findOne({
      where: { id: id },
      relations: ['features', 'comments'],
    });

    delete product.category.images;
    delete product.category.register;
    delete product.category.parent;
    delete product.category.is_last;
    delete product.category.tree_cat;
    delete product.category.created_at;
    delete product.category.updated_at;
    delete product.supplier.first_name;
    delete product.supplier.last_name;
    delete product.supplier.mobile;
    delete product.supplier.is_ban;
    delete product.supplier.email;
    delete product.supplier.password;

    return product;
  }

  async buildProductResponses(product: ProductEntity) {
    return {
      product: {
        ...product,
      },
    };
  }

  async buildProductResponse(
    product: ProductEntity,
  ): Promise<ProductResponseInterface> {
    return { product };
  }
}
