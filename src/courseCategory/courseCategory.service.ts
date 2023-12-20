import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionUtils } from '../utils/functions.utils';
import { AdminEntity } from '../admin/admin.entity';
import { CourseCategoryEntity } from './CourseCategory.entity';
import { CreateCourseCategoryDto } from './dto/CourseCategory.dto';
import { CourseCategoriesResponseInterface } from './types/courseCategoriesResponse.interface';
import { UpdateCourseCategoryDto } from './dto/updateCourseCategory.dto';
import { CourseCategoryResponseInterface } from './types/courseCategoryResponse.interface';

@Injectable()
export class CourseCategoryService {
  constructor(
    @InjectRepository(CourseCategoryEntity)
    private readonly categoryRepository: Repository<CourseCategoryEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async addCategory(
    categoryDto: CreateCourseCategoryDto,
    admin: AdminEntity,
    files: Express.Multer.File[],
  ): Promise<CourseCategoryEntity> {
    const errorResponse = {
      errors: {},
    };

    if (!admin) {
      errorResponse.errors['category'] = 'شما مجاز به فعالیت در این بخش نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const category = new CourseCategoryEntity();

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
  ): Promise<CourseCategoriesResponseInterface> {
    let findAll: string;

    findAll = `select cc.*,a.username as admin_username from course_category cc
                left join admin a on cc.register_id = a.id
                order by cc.id desc`;

    if (query.register) {
      const queryAdmin = `select username from admin where username = '${query.register}' limit 1`;
      const register = await this.adminRepository.query(queryAdmin);

      if (!register[0]) {
        throw new HttpException(
          'دسته بندی ای با این نویسنده یافت نشد',
          HttpStatus.NOT_FOUND,
        );
      }

      findAll = `select cc.*,a.username as admin_username from course_category cc
                left join admin a on cc.register_id = a.id
                where a.username = '${query.register}'
                order by cc.id desc`;
    }

    if (query.limit) {
      findAll = `select cc.*,a.username as admin_username 
                from course_category cc
                left join admin a on cc.register_id = a.id
                order by cc.id desc
                limit ${query.limit}`;
    }

    if (query.offset) {
      findAll = `select cc.*,a.username as admin_username 
                from course_category cc
                left join admin a on cc.register_id = a.id
                order by cc.id desc
                offset ${query.offset}`;
    }

    if (query.offset && query.limit) {
      findAll = `select cc.*,a.username as admin_username 
                from course_category cc
                left join admin a on cc.register_id = a.id
                order by cc.id desc
                limit ${query.limit}
                offset ${query.offset}`;
    }

    const courseCategories = await this.categoryRepository.query(findAll);

    if (!courseCategories.length) {
      throw new HttpException('دسته بندی ایی یافت نشد', HttpStatus.NOT_FOUND);
    }

    const courseCategoriesCount = await this.categoryRepository.count();

    if (!courseCategories.length) {
      throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
    }

    return { courseCategories, courseCategoriesCount };
  }

  async getOneCategory(id: number) {
    const query = `select 
                    cc.*,a.username 
                    from course_category cc 
                    left join admin a on a.id = cc.register_id
                    where cc.id = ${id}`;

    const category = await this.categoryRepository.query(query);

    if (!category[0]) {
      throw new HttpException(
        'دسته بندی مورد نظر یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    return category[0];
  }

  async reIndexTreeCategory(admin: AdminEntity) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این بخش نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const query = `select cc.*,a.username as admin_username
                    from course_category cc
                    left join admin a on cc.register_id = a.id
                    order by cc.id desc`;

    const categories = await this.categoryRepository.query(query);

    categories.forEach(async (item: CourseCategoryEntity) => {
      item.tree_cat = [];

      if (item.parent && item.parent !== 0) {
        let parentId = item.parent.toString();
        const categoryId = item.id.toString();
        item.tree_cat = [categoryId, parentId];
        let parent = categories.find(
          (li: CourseCategoryEntity) => li.id.toString() === parentId,
        );
        while (parent && parent.parent !== 0) {
          parentId = parent.parent.toString();
          item.tree_cat.push(parentId);
          parent = categories.find(
            (li: CourseCategoryEntity) => li.id.toString() === parentId,
          );
        }
      } else {
        item.tree_cat = [item.id.toString()];
      }
    });
    categories.forEach(async (item: CourseCategoryEntity) => {
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

    const query = `select cc.*,a.username as admin_username
                    from course_category cc
                    left join admin a on cc.register_id = a.id
                    order by cc.id desc`;

    const categories = await this.categoryRepository.query(query);

    categories.forEach(async (category: CourseCategoryEntity) => {
      let status: any;
      categories.forEach(async (categoryItem: CourseCategoryEntity) => {
        if (category.id === categoryItem.parent) {
          status = 1;
        }
        if (status === 1) {
          category.is_last = 0;
        } else {
          category.is_last = 1;
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
    await this.getOneCategory(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف دسته بندی نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const removeQuery = `delete from course_category where id = ${id}`;

    const removeResult = await this.categoryRepository.query(removeQuery);

    if (removeResult[1] === 0)
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
    updateCategoryDto: UpdateCourseCategoryDto,
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

    const query = `UPDATE course_category SET title = '${title}' where id = ${id} RETURNING *`;
    const result = await this.categoryRepository.query(query);

    if (images.length) {
      result[0][0].images = images;
      await this.categoryRepository.save(result[0][0]);
    }

    return result[0][0];
  }

  async buildCategoryResponse(
    category: CourseCategoryEntity,
  ): Promise<CourseCategoryResponseInterface> {
    return {
      courseCategory: {
        ...category,
      },
    };
  }
}
