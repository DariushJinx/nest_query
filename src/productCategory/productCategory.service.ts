import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionUtils } from '../utils/functions.utils';
import { AdminEntity } from '../admin/admin.entity';
import { ProductCategoryEntity } from './productCategory.entity';
import { CreateProductCategoryDto } from './dto/productCategory.dto';
import { ProductCategoriesResponseInterface } from './types/productCategoriesResponse.interface';
import { UpdateProductCategoryDto } from './dto/updateProductCategory.dto';
import { ProductCategoryResponseInterface } from './types/productCategoryResponse.interface';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private readonly categoryRepository: Repository<ProductCategoryEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async addCategory(
    categoryDto: CreateProductCategoryDto,
    admin: AdminEntity,
    files: Express.Multer.File[],
  ): Promise<ProductCategoryEntity> {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['admin'] = 'شما مجاز به فعالیت در این بخش نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }
    const category = new ProductCategoryEntity();

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      categoryDto.fileUploadPath,
    );

    delete categoryDto.fileUploadPath;
    delete categoryDto.filename;
    Object.assign(category, categoryDto);

    category.tree_cat = [];
    category.register = admin;
    delete category.register.password;
    category.images = images;

    const checkExistCategory = await this.categoryRepository.findOne({
      where: {
        title: category.title,
      },
    });

    if (checkExistCategory) {
      errorResponse.errors['category'] =
        'دسته بندی وارد شده از قبل موجود می باشد';
      errorResponse.errors['statusCode'] = HttpStatus.BAD_REQUEST;
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }
    const saveCategory = await this.categoryRepository.save(category);

    const categories = await this.categoryRepository.find();

    categories.forEach(async (categoryItem: any) => {
      if (category.parent && category.parent !== 0) {
        let parentCode = category.parent.toString();
        category.tree_cat = [category.id.toString(), parentCode];
        let parent = categories.find(
          (item) => item.id.toString() === parentCode,
        );
        while (parent && parent.parent !== 0) {
          parentCode = parent.parent.toString();
          category.tree_cat.push(parentCode);
          parent = categories.find((item) => item.id.toString() === parentCode);
        }
      } else {
        category.tree_cat = [category.id.toString()];
      }
      await this.categoryRepository.update(
        { id: categoryItem.id },
        { tree_cat: categoryItem.tree_cat },
      );
      await this.categoryRepository.save(saveCategory);
    });

    return saveCategory;
  }

  async getListOfCategories(
    query: any,
  ): Promise<ProductCategoriesResponseInterface> {
    let getAll: string;

    getAll = `
          select pc.*,a.username as register_name from product_category pc
          left join admin a on pc.register_id = a.id
          order by id desc
      `;

    if (query.register_name) {
      getAll = `
          select pc.*,a.username as register_name from product_category pc
          left join admin a on pc.register_id = a.id
          where a.username = '${query.register_name}'
          order by id desc
      `;
    }

    if (query.limit) {
      getAll = `
      select pc.*,a.username as register_name from product_category pc
      left join admin a on pc.register_id = a.id
      order by id desc
      limit ${query.limit}
      `;
    }

    if (query.offset) {
      getAll = `
      select pc.*,a.username as register_name from product_category pc
      left join admin a on pc.register_id = a.id
      order by id desc
      offset ${query.offset}
      `;
    }

    if (query.offset && query.limit) {
      getAll = `
      select pc.*,a.username as register_name from product_category pc
      left join admin a on pc.register_id = a.id
      order by id desc
      offset ${query.offset}
      limit ${query.limit}
      `;
    }
    const productCategories = await this.categoryRepository.query(getAll);

    if (!productCategories.length) {
      throw new HttpException(
        'دسته بندی ای برای محصولات یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    const productCategoriesCount = await this.categoryRepository.count();

    return { productCategories, productCategoriesCount };
  }

  async getOneCategory(id: number) {
    const query = `
        select pc.*,a.username as register_name from product_category pc
        left join admin a on pc.register_id = a.id
        where pc.id = ${id}
        order by id desc
    `;

    const categories = await this.categoryRepository.query(query);

    const category = categories[0];

    if (!category) {
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }

  async reIndexTreeCategory(admin: AdminEntity) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این بخش نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const getAll: string = `
    select pc.*,a.username as register_name from product_category pc
    left join admin a on pc.register_id = a.id
    order by id desc
    `;

    const categories = await this.categoryRepository.query(getAll);

    if (!categories.length) {
      throw new HttpException('دسته بندی ایی یافت نشد', HttpStatus.NOT_FOUND);
    }

    categories.forEach(async (item) => {
      item.tree_cat = [];

      if (item.parent && item.parent !== 0) {
        let parentId = item.parent.toString();
        const categoryId = item.id.toString();
        item.tree_cat = [categoryId, parentId];
        let parent = categories.find((li) => li.id.toString() === parentId);
        while (parent && parent.parent !== 0) {
          parentId = parent.parent.toString();
          item.tree_cat.push(parentId);
          parent = categories.find((li) => li.id.toString() === parentId);
        }
      } else {
        item.tree_cat = [item.id.toString()];
      }
    });
    categories.forEach(async (item) => {
      await this.categoryRepository.update(
        { id: item.id },
        {
          tree_cat: item.tree_cat,
        },
      );
    });

    return categories;
  }

  async setLast(admin: AdminEntity) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این بخش نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const getAll: string = `
    select pc.*,a.username as register_name from product_category pc
    left join admin a on pc.register_id = a.id
    order by id desc
    `;

    const categories = await this.categoryRepository.query(getAll);

    if (!categories.length) {
      throw new HttpException('دسته بندی ایی یافت نشد', HttpStatus.NOT_FOUND);
    }

    categories.forEach(async (category) => {
      let status: any;
      categories.forEach((categoryItem) => {
        if (category.id === categoryItem.parent) {
          status = 1;
        }
      });
      if (status === 1) category.is_last = 0;
      else category.is_last = 1;

      await this.categoryRepository.update(
        { id: category.id },
        {
          ...category,
        },
      );
    });

    return categories;
  }

  async deleteCategory(
    id: number,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    await this.getOneCategory(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف دسته بندی نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const query = `delete from product_category where id = ${id}`;

    const removeCourse = await this.categoryRepository.query(query);

    if (removeCourse[1] === 0)
      throw new HttpException(
        'دسته بندی  مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );

    return {
      message: 'دسته بندی مورد نظر با موفقیت حذف گردید',
    };
  }

  async updateCategory(
    id: number,
    admin: AdminEntity,
    updateCategoryDto: UpdateProductCategoryDto,
    files: Express.Multer.File[],
  ) {
    const errorResponse = {
      errors: {},
    };

    const category = await this.getOneCategory(id);

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      updateCategoryDto.fileUploadPath,
    );

    if (!admin) {
      errorResponse.errors['admin'] =
        'شما مجاز به به روز رسانی دسته بندی نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    let title = category.title;
    if (updateCategoryDto.title) title = updateCategoryDto.title;

    const query = `UPDATE product_category
    SET title = '${title}'
    where id = ${id} RETURNING *`;

    const result = await this.categoryRepository.query(query);

    if (images.length > 0) {
      result[0][0].images = images;
      await this.categoryRepository.save(result[0][0]);
    }

    return result[0][0];
  }

  async buildCategoryResponse(
    category: ProductCategoryEntity,
  ): Promise<ProductCategoryResponseInterface> {
    return {
      productCategory: {
        ...category,
      },
    };
  }
}
