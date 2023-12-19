import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionUtils } from '../utils/functions.utils';
import { AdminEntity } from '../admin/admin.entity';
import { BlogCategoryEntity } from './blogCategory.entity';
import { CreateBlogCategoryDto } from './dto/blogCategory.dto';
import { BlogCategoriesResponseInterface } from './types/BlogCategoriesResponse.interface';
import { UpdateBlogCategoryDto } from './dto/updateBlogCategory.dto';
import { BlogCategoryResponseInterface } from './types/BlogCategoryResponse.interface';

@Injectable()
export class BlogCategoryService {
  constructor(
    @InjectRepository(BlogCategoryEntity)
    private readonly categoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async addCategory(
    categoryDto: CreateBlogCategoryDto,
    admin: AdminEntity,
    files: Express.Multer.File[],
  ): Promise<BlogCategoryEntity> {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['category'] = 'شما مجاز به فعالیت در این بخش نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const category = new BlogCategoryEntity();

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
  ): Promise<BlogCategoriesResponseInterface> {
    let findAll: string;

    findAll = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id
    order by bc.id desc`;

    if (query.register) {
      findAll = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id
    where a.username = '${query.register}'
    order by bc.id desc`;
    }

    if (query.limit) {
      findAll = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id 
    order by bc.id desc
    limit ${query.limit}`;
    }

    if (query.offset) {
      findAll = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id
    order by bc.id desc
    offset ${query.offset}`;
    }

    const blogCategories = await this.categoryRepository.query(findAll);

    if (!blogCategories.length) {
      throw new HttpException(
        'دسته بندی ای با این نویسنده یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    const blogCategoriesCount = await this.categoryRepository.count();

    return { blogCategories, blogCategoriesCount };
  }

  async getOneCategory(id: number) {
    const query = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id
    where bc.id = ${id}`;

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

    const query = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id
    order by bc.id desc`;

    const categories: BlogCategoryEntity[] =
      await this.categoryRepository.query(query);

    categories.forEach(async (item: BlogCategoryEntity) => {
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

    const query = `select bc.*,
    a.username as register_name
    from blog_category bc
    left join admin a on bc.register_id = a.id
    order by bc.id desc`;

    const categories = await this.categoryRepository.query(query);

    categories.forEach((category: BlogCategoryEntity) => {
      categories.forEach(async (categoryItem: BlogCategoryEntity) => {
        let status: any;
        if (category.parent === categoryItem.id) {
          status = 1;
        }
        if (status === 1) {
          category.isLast = 0;
        } else {
          category.isLast = 1;
        }
        await this.categoryRepository.save(category);
      });
    });

    return categories;
  }

  async deleteCategory(
    id: number,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف دسته بندی نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const category = await this.getOneCategory(id);

    if (!category) {
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    const query = `delete from blog_category where id = ${id}`;

    const removeCategory = await this.categoryRepository.query(query);

    if (removeCategory[1] === 0)
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );

    return {
      message: 'دسته بندی مورد نظر با موفقیت حذف گردید',
    };
  }

  async updateCategory(
    id: number,
    admin: AdminEntity,
    updateCategoryDto: UpdateBlogCategoryDto,
    files: Express.Multer.File[],
  ) {
    const errorResponse = {
      errors: {},
    };

    const blogCategory = await this.getOneCategory(id);

    if (!blogCategory) {
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    let title = blogCategory.title;

    if (updateCategoryDto.title) title = updateCategoryDto.title;
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
    const query = `UPDATE blog_category SET title = '${title}' where id = ${id} RETURNING *`;
    const result = await this.categoryRepository.query(query);

    if (images.length > 0) {
      result[0][0].images = images;
      await this.categoryRepository.save(result[0][0]);
    }

    return result[0][0];
  }

  async buildCategoryResponse(
    category: BlogCategoryEntity,
  ): Promise<BlogCategoryResponseInterface> {
    return {
      BlogCategory: {
        ...category,
      },
    };
  }
}
