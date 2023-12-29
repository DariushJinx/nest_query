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
    let findAll: string;

    findAll = `select blog.*,
    a.username as register_name,bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    order by blog.id desc`;

    if (query.author) {
      findAll = `select blog.*,
    a.username as register_name,bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    where a.username = '${query.author}'
    order by blog.id desc`;
    }

    if (query.search) {
      findAll = `select blog.*,
    a.username as register_name,bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    where blog.title = '${query.search}'
    order by blog.id desc`;
    }

    if (query.limit) {
      findAll = `select blog.*,
    a.username as register_name,bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    order by blog.id desc
    limit ${query.limit}`;
    }

    if (query.offset) {
      findAll = `select blog.*,
    a.username as register_name,bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    order by blog.id desc
    offset ${query.offset}`;
    }

    if (query.offset && query.limit) {
      findAll = `select blog.*,
    a.username as register_name,bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    order by blog.id desc
    limit ${query.limit}
    offset ${query.offset}`;
    }

    const blogs = await this.blogRepository.query(findAll);

    if (!blogs.length) {
      throw new HttpException(
        'دسته بندی ای با این نویسنده یافت نشد',
        HttpStatus.NOT_FOUND,
      );
    }

    const blogsCount = await this.blogRepository.count();

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
  //       delete blog.category.is_last;
  //       delete blog.category.tree_cat;
  //       delete blog.category.createdAt;
  //       delete blog.category.updatedAt;
  //       delete blog.author.first_name;
  //       delete blog.author.last_name;
  //       delete blog.author.mobile;
  //       delete blog.author.is_ban;
  //       delete blog.author.email;
  //       delete blog.author.password;
  //     });

  //     await this.blogRepository.save(allBlogs);
  //   });

  //   return allBlogs;
  // }

  async getOneBlogWithId(id: number): Promise<BlogEntity> {
    const query = `
    select blog.*,
    a.username as register_name,
    bc.title as category_title
    from blog
    left join admin a on blog.author_id = a.id
    left join blog_category bc on blog.category_id = bc.id
    where blog.id = ${id}`;

    const blogs = await this.blogRepository.query(query);
    const blog = blogs[0];

    if (!blog) {
      throw new HttpException('مقاله ای یافت نشد', HttpStatus.NOT_FOUND);
    }

    return blog;
  }

  async deleteOneBlogWithId(
    id: number,
    admin: AdminEntity,
  ): Promise<{ message: string }> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف مقاله نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const blog = await this.getOneBlogWithId(id);

    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const query = `delete from blog where id = ${id}`;

    const removeBlog = await this.blogRepository.query(query);

    if (removeBlog[1] === 0)
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);

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

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      updateBlogDto.fileUploadPath,
    );

    if (!admin) {
      errorResponse.errors['admin'] = 'شما مجاز به به روز رسانی مقاله نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.FORBIDDEN;
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    const blog = await this.getOneBlogWithId(id);

    if (!blog) {
      throw new HttpException('مقاله مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    let title = blog.title;
    let short_title = blog.short_title;
    let text = blog.text;
    let short_text = blog.short_text;
    if (updateBlogDto.title) title = updateBlogDto.title;
    if (updateBlogDto.short_title) short_title = updateBlogDto.short_title;
    if (updateBlogDto.text) text = updateBlogDto.text;
    if (updateBlogDto.short_text) short_text = updateBlogDto.short_text;
    const query = `UPDATE blog SET title = '${title}', short_title = '${short_title}',
    text = '${text}',
    short_text = '${short_text}'
    where id = ${id} RETURNING *`;
    const result = await this.blogRepository.query(query);

    if (images.length > 0) {
      result[0][0].images = images;
      await this.blogRepository.save(result[0][0]);
    }

    return result[0][0];
  }

  async favoriteBlog(blogId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['blog_bookmarks'],
    });
    const blog = await this.getOneBlogWithId(blogId);

    let favorite: any;

    user.blog_bookmarks.map((blogInFavorite) => {
      favorite = blogInFavorite.id;
    });

    const isNotFavorite =
      user.blog_bookmarks.findIndex(
        (blogInFavorite) => blogInFavorite.id === blog.id,
      ) === -1;

    if (isNotFavorite) {
      if (favorite === blog.id) {
        throw new HttpException(
          'مقاله شما از قبل در لیست علاقه مندی ها موجود می باشد',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        user.blog_bookmarks.push(blog);
        blog.favorites_count++;
        await this.userRepository.save(user);
        await this.blogRepository.save(blog);
      }
    }

    return blog;
  }

  async deleteBlogFromFavorite(blogId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['blog_bookmarks'],
    });
    const blog = await this.getOneBlogWithId(blogId);

    const blogIndex = user.blog_bookmarks.findIndex((blogInFavorite) => {
      blogInFavorite.id === blog.id;
      console.log('blogInFavorite.id:', blogInFavorite.id);
      console.log('blogInFavorite.id:', blog.id);
      console.log('blogInFavorite.id:', blogInFavorite.id === blog.id);
    });

    console.log('blogIndex:', blogIndex);

    if (blogIndex >= 0) {
      user.blog_bookmarks.splice(blogIndex, 1);
      if (blog.favorites_count < 0) {
        blog.favorites_count = 0;
      }
      blog.favorites_count--;
      await this.userRepository.save(user);
      await this.blogRepository.save(blog);
    }

    return blog;
  }

  async buildBlogResponse(blog: BlogEntity): Promise<BlogResponseInterface> {
    return { blog };
  }
}
