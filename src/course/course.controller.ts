import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User } from 'src/decorators/user.decorators';
import { CourseService } from './course.service';
import { CourseResponseInterface } from './types/courseResponse.interface';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { AdminEntity } from 'src/admin/admin.entity';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { multerConfig } from 'src/middlewares/multer.middleware';
import { CreateCourseDto } from './dto/course.dto';
import { CoursesResponseInterface } from './types/coursesResponse.interface';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createCourse(
    @Admin() admin: AdminEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createCourseDto: CreateCourseDto,
  ) {
    const course = await this.courseService.createCourse(
      admin,
      createCourseDto,
      files,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Get('list')
  async findAllCourses(@Query() query: any): Promise<CoursesResponseInterface> {
    return await this.courseService.findAllCourses(query);
  }

  @Get('all_courses')
  async findAllCoursesWithRating() {
    return await this.courseService.findAllCoursesWithRating();
  }

  @Get(':id')
  async getOneCourse(
    @Param('id') id: number,
  ): Promise<CourseResponseInterface> {
    const course = await this.courseService.currentCourse(id);
    return await this.courseService.buildCourseResponses(course);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneCourse(@Param('id') id: number, @Admin() admin: AdminEntity) {
    return await this.courseService.deleteOneCourseWithID(id, admin);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateOneCourseWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body('') updateCourseDto: UpdateCourseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<CourseResponseInterface> {
    const course = await this.courseService.updateCourse(
      id,
      admin,
      updateCourseDto,
      files,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Put(':courseId/favorite')
  @UseGuards(AuthGuard)
  async InsertCourseToFavorite(
    @Param('courseId') courseId: number,
    @User('id') currentUser: number,
  ): Promise<CourseResponseInterface> {
    const course = await this.courseService.favoriteCourse(
      courseId,
      currentUser,
    );
    return await this.courseService.buildCourseResponse(course);
  }

  @Delete(':courseId/favorite')
  @UseGuards(AuthGuard)
  async deleteCourseFromFavorite(
    @User('id') currentUser: number,
    @Param('courseId') courseId: number,
  ) {
    const course = await this.courseService.deleteCourseFromFavorite(
      courseId,
      currentUser,
    );
    return await this.courseService.buildCourseResponse(course);
  }
}
