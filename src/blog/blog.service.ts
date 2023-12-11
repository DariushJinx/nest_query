import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './blog.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateBlogDto } from './dto/blog.dto';
import { BlogResponseInterface } from './types/blogResponse.interface';
import { FunctionUtils } from '../utils/functions.utils';
import { BlogsResponseInterface } from './types/blogsResponse.interface';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { AdminEntity } from '../admin/admin.entity';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private readonly blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async createBlog(
    admin: AdminEntity,
    createBlogDto: CreateBlogDto,
    files: Express.Multer.File[],
  ): Promise<BlogEntity> {
    const errorResponse = {
      errors: {},
    };

    const checkExistsCategory = await this.blogCategoryRepository.findOne({
      where: { id: Number(createBlogDto.category) },
    });

    if (!checkExistsCategory) {
      errorResponse.errors['category'] = 'دسته بندی مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }

    if (!admin) {
      errorResponse.errors['error'] = 'شما مجاز به ثبت مقاله نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const blog = new BlogEntity();

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createBlogDto.fileUploadPath,
    );

    delete createBlogDto.fileUploadPath;
    delete createBlogDto.filename;
    Object.assign(blog, createBlogDto);
    blog.tree_blog = [];
    blog.tree_blog_name = [];
    blog.author = admin;
    delete blog.author.password;
    blog.images = images;
    delete blog.author.password;

    const saveBlog = await this.blogRepository.save(blog);

    const blogCategories = await this.blogCategoryRepository.findOne({
      where: { id: +saveBlog.category },
    });

    blogCategories.tree_cat.forEach(async (item) => {
      const category = await this.blogCategoryRepository.findOne({
        where: { id: +item },
      });

      if (category) {
        blog.tree_blog_name.push(category.title);
        blog.tree_blog = blogCategories.tree_cat;
      }
      await this.blogRepository.save(blog);
    });

    await this.blogRepository.save(saveBlog);

    return saveBlog;
  }

  async findAllBlogs(query: any): Promise<BlogsResponseInterface> {
    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author');

    if (query.search) {
      queryBuilder.andWhere('blog.tags LIKE :search', {
        search: `%${query.search}`,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('blog.tags LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.author) {
      const author = await this.adminRepository.findOne({
        where: { username: query.author },
      });
      if (!author) {
        throw new HttpException(
          'مقاله ای با این نویسنده یافت نشد',
          HttpStatus.NOT_FOUND,
        );
      }
      queryBuilder.andWhere('blog.authorId = :id', {
        id: author.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('blog.createdAt', 'DESC');

    const blogsCount = await queryBuilder.getCount();
    const blogs = await queryBuilder.getMany();

    if (!blogs.length) {
      throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
    }

    blogs.forEach((blog) => {
      delete blog.author.id;
      delete blog.author.first_name;
      delete blog.author.last_name;
      delete blog.author.mobile;
      delete blog.author.isBan;
      delete blog.author.email;
      delete blog.author.password;
    });

    return { blogs, blogsCount };
  }

  // async findAllBlogsWithRating() {
  //   const blogs = await this.blogRepository.find();

  //   if (!blogs.length) {
  //     throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
  //   }

  //   const comments = await this.commentRepository.find({
  //     where: { show: 1 },
  //   });

  //   const allBlogs = [];

  //   blogs.map(async (blog) => {
  //     let blogTotalScore: number = 5;
  //     const blogScores = comments?.filter((comment) => {
  //       if (comment.blog_id) {
  //         if (comment.blog_id.id.toString() === blog.id.toString()) {
  //           return comment;
  //         }
  //       }
  //     });

  //     blogScores.forEach((comment) => {
  //       blogTotalScore += Number(comment.score);
  //     });
  //     let average = ~~(blogTotalScore / (blogScores.length + 1));
  //     if (average < 0) {
  //       average = 0;
  //     } else if (average > 5) {
  //       average = 5;
  //     }
  //     allBlogs.push({
  //       ...blog,
  //       blogAverageScore: average,
  //     });

  //     blogs.forEach((blog) => {
  //       delete blog.category.images;
  //       delete blog.category.register;
  //       delete blog.category.parent;
  //       delete blog.category.isLast;
  //       delete blog.category.tree_cat;
  //       delete blog.category.createdAt;
  //       delete blog.category.updatedAt;
  //       delete blog.author.first_name;
  //       delete blog.author.last_name;
  //       delete blog.author.mobile;
  //       delete blog.author.isBan;
  //       delete blog.author.email;
  //       delete blog.author.password;
  //     });

  //     await this.blogRepository.save(allBlogs);
  //   });

  //   return allBlogs;
  // }

  async getOneBlogWithSlug(slug: string): Promise<BlogEntity> {
    const blog = await this.blogRepository.findOne({
      where: { slug: slug },
      relations: ['comments'],
    });

    if (!blog) {
      throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
    }

    delete blog.category.id;
    delete blog.category.images;
    delete blog.category.register;
    delete blog.category.parent;
    delete blog.category.isLast;
    delete blog.category.tree_cat;
    delete blog.category.createdAt;
    delete blog.category.updatedAt;
    delete blog.author.id;
    delete blog.author.first_name;
    delete blog.author.last_name;
    delete blog.author.mobile;
    delete blog.author.isBan;
    delete blog.author.email;
    delete blog.author.password;

    return blog;
  }

  async getOneBlogWithID(id: number): Promise<BlogEntity> {
    const blog = await this.blogRepository.findOne({
      where: { id: id },
    });

    if (!blog) {
      throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
    }

    delete blog.category.id;
    delete blog.category.images;
    delete blog.category.register;
    delete blog.category.parent;
    delete blog.category.isLast;
    delete blog.category.tree_cat;
    delete blog.category.createdAt;
    delete blog.category.updatedAt;
    delete blog.author.id;
    delete blog.author.first_name;
    delete blog.author.last_name;
    delete blog.author.mobile;
    delete blog.author.isBan;
    delete blog.author.email;
    delete blog.author.password;

    return blog;
  }

  async deleteOneBlogWithSlug(
    slug: string,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف مقاله نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const blog = await this.getOneBlogWithSlug(slug);
    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    await this.blogRepository.delete({ slug });

    return {
      message: 'مقاله مورد نظر با موفقیت حذف گردید',
    };
  }

  async updateBlog(
    id: number,
    admin: AdminEntity,
    updateBlogDto: UpdateBlogDto,
    files: Express.Multer.File[],
  ) {
    const errorResponse = {
      errors: {},
    };

    const blog = await this.getOneBlogWithID(id);

    if (!blog) {
      errorResponse.errors['blog'] = 'مقاله مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }

    if (!admin) {
      errorResponse.errors['admin'] = 'شما مجاز به به روز رسانی مقاله نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      updateBlogDto.fileUploadPath,
    );

    Object.assign(blog, updateBlogDto);

    delete blog.category.id;
    delete blog.category.images;
    delete blog.category.register;
    delete blog.category.parent;
    delete blog.category.isLast;
    delete blog.category.tree_cat;
    delete blog.category.createdAt;
    delete blog.category.updatedAt;
    delete blog.author.id;
    delete blog.author.first_name;
    delete blog.author.last_name;
    delete blog.author.mobile;
    delete blog.author.isBan;
    delete blog.author.email;
    delete blog.author.password;

    blog.images = images;

    return await this.blogRepository.save(blog);
  }

  async favoriteBlog(blogId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['blog_bookmarks'],
    });
    const blog = await this.getOneBlogWithID(blogId);

    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const isNotFavorite =
      user.blog_bookmarks.findIndex(
        (blogInFavorite) => blogInFavorite.id === blog.id,
      ) === -1;

    delete blog.category.id;
    delete blog.category.images;
    delete blog.category.register;
    delete blog.category.parent;
    delete blog.category.isLast;
    delete blog.category.tree_cat;
    delete blog.category.createdAt;
    delete blog.category.updatedAt;
    delete blog.author.id;
    delete blog.author.first_name;
    delete blog.author.last_name;
    delete blog.author.mobile;
    delete blog.author.isBan;
    delete blog.author.email;
    delete blog.author.password;

    if (isNotFavorite) {
      user.blog_bookmarks.push(blog);
      blog.favoritesCount++;
      await this.userRepository.save(user);
      await this.blogRepository.save(blog);
    }

    return blog;
  }

  async deleteBlogFromFavorite(blogId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['blog_bookmarks'],
    });
    const blog = await this.getOneBlogWithID(blogId);

    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const blogIndex = user.blog_bookmarks.findIndex(
      (blogInFavorite) => blogInFavorite.id === blog.id,
    );

    if (blogIndex >= 0) {
      user.blog_bookmarks.splice(blogIndex, 1);
      if (blog.favoritesCount < 0) {
        blog.favoritesCount = 0;
      }
      blog.favoritesCount--;
      await this.userRepository.save(user);
      await this.blogRepository.save(blog);
    }

    delete blog.category.id;
    delete blog.category.images;
    delete blog.category.register;
    delete blog.category.parent;
    delete blog.category.isLast;
    delete blog.category.tree_cat;
    delete blog.category.createdAt;
    delete blog.category.updatedAt;
    delete blog.author.id;
    delete blog.author.first_name;
    delete blog.author.last_name;
    delete blog.author.mobile;
    delete blog.author.isBan;
    delete blog.author.email;
    delete blog.author.password;

    return blog;
  }

  async buildBlogResponse(blog: BlogEntity): Promise<BlogResponseInterface> {
    return { blog };
  }
}
