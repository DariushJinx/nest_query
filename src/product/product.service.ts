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
      where: { id: Number(createProductDto.category) },
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
    let getAll: string;

    getAll = `
        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
    `;

    if (query.search) {
      const search_split = query.search.split('');
      const search_split_join = search_split.join('');
      if (query.search.includes(search_split_join)) {
        getAll = `
        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        where p.title like '%${search_split_join}%'
        or p.short_title like '%${search_split_join}%'
        or p.text like '%${search_split_join}%'
        or p.short_text like '%${search_split_join}%'
        order by p.id desc
        `;
      }
    }

    if (query.supplier_name) {
      const supplier_name_split = query.supplier_name.split('');
      const supplier_name_split_join = supplier_name_split.join('');
      if (query.supplier_name.includes(supplier_name_split_join)) {
        getAll = `
        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        where a.username like '%${supplier_name_split_join}%'
        order by p.id desc
        `;
      }
    }

    if (query.limit) {
      getAll = `
        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
        limit ${query.limit}
      `;
    }

    if (query.offset) {
      getAll = `
        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
        offset ${query.offset}
      `;
    }

    if (query.offset && query.limit) {
      getAll = `
        select p.*,
        a.username as supplier_name,
        pc.title as product_category_title 
        from products p
        left join admin a on p.supplier_id = a.id
        left join product_category pc on pc.id = p.category_id
        order by p.id desc
        offset ${query.offset}
        limit ${query.limit}
      `;
    }

    const products = await this.productRepository.query(getAll);

    if (!products.length) {
      throw new HttpException('هیچ محصولی یافت نشد', HttpStatus.BAD_REQUEST);
    }

    const productsCount = await this.productRepository.count();

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

    await this.currentProduct(id);

    const query = `delete from chapter where id = ${id}`;

    const removeProduct = await this.productRepository.query(query);

    if (removeProduct[1] === 0)
      throw new HttpException('محصول مورد نظر یافت نشد', HttpStatus.NOT_FOUND);

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
    const product = await this.currentProduct(id);

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

    let title = product.title;
    if (updateProductDto.title) title = updateProductDto.title;

    let short_title = product.short_title;
    if (updateProductDto.short_title)
      short_title = updateProductDto.short_title;

    let text = product.text;
    if (updateProductDto.text) text = updateProductDto.text;

    let short_text = product.short_text;
    if (updateProductDto.short_text) short_text = updateProductDto.short_text;

    let price = product.price;
    if (updateProductDto.price) price = updateProductDto.price;

    let discount = product.discount;
    if (updateProductDto.discount) discount = updateProductDto.discount;

    let count = product.count;
    if (updateProductDto.count) count = updateProductDto.count;

    const query = `UPDATE products
    SET title = '${title}',
    short_title = '${short_title}',
    text = '${text}',
    short_text = '${short_text}',
    price = '${price}',
    discount = '${discount}',
    count = '${count}'
    where id = ${id} RETURNING *`;

    const result = await this.productRepository.query(query);

    if (images.length > 0) {
      result[0][0].images = images;
      await this.productRepository.save(result[0][0]);
    }

    return result[0][0];
  }

  async favoriteProduct(productId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['products_bookmarks'],
    });
    const product = await this.currentProduct(productId);

    let favorite: any;

    user.products_bookmarks.map((productInFavorite) => {
      favorite = productInFavorite.id;
    });

    const isNotFavorite =
      user.products_bookmarks.findIndex(
        (productInFavorite) => productInFavorite.id === product.id,
      ) === -1;

    if (favorite === product.id) {
      throw new HttpException(
        'محصول شما از قبل در لیست علاقه مندی ها موجود می باشد',
        HttpStatus.BAD_REQUEST,
      );
    }

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
    const product = await this.currentProduct(productId);

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
  }

  async currentProduct(id: number) {
    const query = `
    select p.*,
    a.username as supplier_name,
    pc.title as product_category_title 
    from products p
    left join admin a on p.supplier_id = a.id
    left join product_category pc on pc.id = p.category_id
    where p.id= ${id}
    `;
    const products = await this.productRepository.query(query);

    if (!products.length) {
      throw new HttpException('محصول مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const product = products[0];

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
