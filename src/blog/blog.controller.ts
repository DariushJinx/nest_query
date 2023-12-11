import {
  Body,
  Controller,
  Post,
  UsePipes,
  UseInterceptors,
  UploadedFiles,
  Get,
  Query,
  UseGuards,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { User } from '../decorators/user.decorators';
import { CreateBlogDto } from './dto/blog.dto';
import { BlogResponseInterface } from './types/blogResponse.interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateBlogDto } from './dto/updateBlog.dto';
import { BlogsResponseInterface } from './types/blogsResponse.interface';
import { AdminEntity } from '../admin/admin.entity';
import { Admin } from '../decorators/admin.decorators';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { multerConfig } from 'src/middlewares/multer.middleware';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createBlog(
    @Admin() admin: AdminEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createBlogDto: CreateBlogDto,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.createBlog(admin, createBlogDto, files);
    return await this.blogService.buildBlogResponse(blog);
  }

  @Get('list')
  async findAllBlogs(@Query() query: any): Promise<BlogsResponseInterface> {
    return await this.blogService.findAllBlogs(query);
  }

  // @Get('all_blogs')
  // async findAllBlogsWithRating() {
  //   return await this.blogService.findAllBlogsWithRating();
  // }

  @Get(':slug')
  async getOneBlogWithSlug(
    @Param('slug') slug: string,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.getOneBlogWithSlug(slug);
    return await this.blogService.buildBlogResponse(blog);
  }

  @Delete(':slug')
  @UseGuards(AdminAuthGuard)
  async deleteOneBlogWithSlug(
    @Admin() admin: AdminEntity,
    @Param('slug') slug: string,
  ): Promise<{ message: string }> {
    await this.blogService.deleteOneBlogWithSlug(slug, admin);

    return {
      message: 'مقاله مورد نظر با موفقیت حذف گردید',
    };
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneBlogWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateBlogDto: UpdateBlogDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.updateBlog(
      id,
      admin,
      updateBlogDto,
      files,
    );
    return await this.blogService.buildBlogResponse(blog);
  }

  @Put(':blogId/favorite')
  @UseGuards(AuthGuard)
  async InsertBlogToFavorite(
    @Param('blogId') blogId: number,
    @User('id') currentUser: number,
  ): Promise<BlogResponseInterface> {
    const blog = await this.blogService.favoriteBlog(blogId, currentUser);
    return await this.blogService.buildBlogResponse(blog);
  }

  @Delete(':blogId/favorite')
  @UseGuards(AuthGuard)
  async deleteBlogFromFavorite(
    @User('id') currentUser: number,
    @Param('blogId') blogId: number,
  ) {
    const blog = await this.blogService.deleteBlogFromFavorite(
      blogId,
      currentUser,
    );
    return await this.blogService.buildBlogResponse(blog);
  }
}
