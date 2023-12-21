import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { FunctionUtils } from '../utils/functions.utils';
import { CourseEntity } from './course.entity';
import { CreateCourseDto } from './dto/course.dto';
import { CoursesResponseInterface } from './types/coursesResponse.interface';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { CourseResponseInterface } from './types/courseResponse.interface';
import { CourseCategoryEntity } from '../courseCategory/courseCategory.entity';
import { AdminEntity } from 'src/admin/admin.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(CourseCategoryEntity)
    private readonly courseCategoryRepository: Repository<CourseCategoryEntity>,
  ) {}

  async createCourse(
    admin: AdminEntity,
    createCourseDto: CreateCourseDto,
    files: Express.Multer.File[],
  ) {
    const errorResponse = {
      errors: {},
    };

    if (
      createCourseDto.type !== 'free' &&
      createCourseDto.type !== 'cash' &&
      createCourseDto.type !== 'special'
    ) {
      errorResponse.errors['error'] = 'نوع وارد شده برای دوره مناسب نمی باشد';
      errorResponse.errors['statusCode'] = HttpStatus.BAD_REQUEST;
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }
    if (!admin) {
      errorResponse.errors['error'] = 'شما مجاز به ثبت دوره نیستید';
      errorResponse.errors['statusCode'] = HttpStatus.UNAUTHORIZED;
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const checkExistsCategory = await this.courseCategoryRepository.findOne({
      where: { id: Number(createCourseDto.category) },
    });

    if (!checkExistsCategory) {
      errorResponse.errors['category'] = 'دسته بندی مورد نظر یافت نشد';
      errorResponse.errors['statusCode'] = HttpStatus.NOT_FOUND;
      throw new HttpException(errorResponse, HttpStatus.NOT_FOUND);
    }
    const course = new CourseEntity();
    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      createCourseDto.fileUploadPath,
    );

    Object.assign(course, createCourseDto);
    course.teacher = admin;
    if (Number(createCourseDto.price) > 0 && createCourseDto.type === 'free') {
      errorResponse.errors['error'] = 'برای دوره ی رایگان نمیتوان قیمت ثبت کرد';
      errorResponse.errors['statusCode'] = HttpStatus.BAD_REQUEST;
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }
    if (
      Number(createCourseDto.price) === 0 &&
      createCourseDto.type !== 'free'
    ) {
      errorResponse.errors['error'] =
        'برای دوره ی غیر رایگان باید قیمت تعیین کرد';
      errorResponse.errors['statusCode'] = HttpStatus.BAD_REQUEST;
      throw new HttpException(errorResponse, HttpStatus.BAD_REQUEST);
    }
    delete course.teacher.password;
    course.images = images;
    course.tree_course = [];
    course.tree_course_name = [];

    const saveCourse = await this.courseRepository.save(course);

    const courseCategories = await this.courseCategoryRepository.findOne({
      where: { id: +course.category },
    });

    courseCategories.tree_cat.forEach(async (item) => {
      const category = await this.courseCategoryRepository.findOne({
        where: { id: +item },
      });

      course.tree_course_name.push(category.title);
      course.tree_course = courseCategories.tree_cat;
      await this.courseRepository.save(course);
    });

    return await this.courseRepository.save(saveCourse);
  }

  async findAllCourses(query: any): Promise<CoursesResponseInterface> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher');

    if (query.search) {
      queryBuilder.andWhere('course.tags LIKE :search', {
        search: `%${query.search}`,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('course.tags LIKE :tag', {
        tag: `%${query.tag}`,
      });
    }

    if (query.teacher) {
      const teacher = await this.adminRepository.findOne({
        where: { username: query.teacher },
      });

      if (!teacher) {
        throw new HttpException(
          'دوره ای با این مشخصات یافت نشد',
          HttpStatus.UNAUTHORIZED,
        );
      }

      queryBuilder.andWhere('course.teacher_id = :id', {
        id: teacher.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('course.createdAt', 'DESC');

    const coursesCount = await queryBuilder.getCount();
    const courses = await queryBuilder.getMany();

    if (!courses.length) {
      throw new HttpException('هیچ دوره ای یافت نشد', HttpStatus.BAD_REQUEST);
    }

    courses.forEach((course) => {
      delete course.teacher.id;
      delete course.teacher.first_name;
      delete course.teacher.last_name;
      delete course.teacher.mobile;
      delete course.teacher.is_ban;
      delete course.teacher.email;
      delete course.teacher.password;
    });
    return { courses, coursesCount };
  }

  // async findAllCoursesWithRating() {
  //   const courses = await this.courseRepository.find();
  //   const comments = await this.commentRepository.find({
  //     where: { show: 1 },
  //   });

  //   if (!courses.length) {
  //     throw new HttpException('هیچ دوره ای یافت نشد', HttpStatus.BAD_REQUEST);
  //   }

  //   const allCourses = [];

  //   courses.map(async (course) => {
  //     let courseTotalScore: number = 5;
  //     const courseScores = comments?.filter((comment) => {
  //       if (comment.course_id) {
  //         if (comment.course_id.id.toString() === course.id.toString()) {
  //           return comment;
  //         }
  //       }
  //     });

  //     courseScores.forEach((comment) => {
  //       courseTotalScore += Number(comment.score);
  //     });
  //     let average = ~~(courseTotalScore / (courseScores.length + 1));
  //     if (average < 0) {
  //       average = 0;
  //     } else if (average > 5) {
  //       average = 5;
  //     }
  //     allCourses.push({
  //       ...course,
  //       courseAverageScore: average,
  //     });

  //     courses.forEach((course) => {
  //       delete course.teacher.password;
  //       delete course.category.register;
  //       delete course.category.images;
  //     });

  //     courses.forEach((course) => {
  //       delete course.category.images;
  //       delete course.category.register;
  //       delete course.category.parent;
  //       delete course.category.is_last;
  //       delete course.category.tree_cat;
  //       delete course.category.createdAt;
  //       delete course.category.updatedAt;
  //       delete course.teacher.first_name;
  //       delete course.teacher.last_name;
  //       delete course.teacher.mobile;
  //       delete course.teacher.is_ban;
  //       delete course.teacher.email;
  //       delete course.teacher.password;
  //     });

  //     await this.courseRepository.save(allCourses);
  //   });

  //   return allCourses;
  // }

  async currentCourse(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id: id },
      relations: ['chapters', 'chapters.episodes'],
    });

    if (!course) {
      throw new HttpException('هیچ دوره ای یافت نشد', HttpStatus.BAD_REQUEST);
    }

    delete course.category.images;
    delete course.category.register;
    delete course.category.parent;
    delete course.category.is_last;
    delete course.category.tree_cat;
    delete course.category.createdAt;
    delete course.category.updatedAt;
    delete course.teacher.first_name;
    delete course.teacher.last_name;
    delete course.teacher.mobile;
    delete course.teacher.is_ban;
    delete course.teacher.email;
    delete course.teacher.password;
    course.chapters.map((chapter) => {
      delete chapter.course_id;
      delete chapter.createdAt;
      delete chapter.updatedAt;
    });
    course.chapters.map((chapter) =>
      chapter.episodes.map((episode) => {
        delete episode.chapter_id;
      }),
    );
    return course;
  }

  async getOneCourseWithId(id: number): Promise<CourseEntity> {
    const course = await this.courseRepository.findOne({
      where: { id: id },
    });

    if (!course) {
      throw new HttpException('هیچ دوره ای یافت نشد', HttpStatus.BAD_REQUEST);
    }

    return course;
  }

  async deleteOneCourseWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف دوره نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    await this.getOneCourseWithId(id);

    await this.courseRepository.delete({ id });

    return {
      message: 'دوره مورد نظر با موفقیت حذف شد',
    };
  }

  async updateCourse(
    id: number,
    admin: AdminEntity,
    updateCourseDto: UpdateCourseDto,
    files: Express.Multer.File[],
  ) {
    const course = await this.currentCourse(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به به روز رسانی دوره نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const images = FunctionUtils.ListOfImagesForRequest(
      files,
      updateCourseDto.fileUploadPath,
    );

    Object.assign(course, updateCourseDto);

    course.images = images;

    if (
      Number(updateCourseDto.price) > 0 &&
      course.type === 'free' &&
      updateCourseDto.type === 'free'
    ) {
      throw new HttpException(
        'برای دوره ی رایگان نمیتوان قیمت ثبت کرد',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      Number(updateCourseDto.price) === 0 &&
      course.type !== 'free' &&
      updateCourseDto.type !== 'free'
    ) {
      throw new HttpException(
        'برای دوره ی غیر رایگان باید قیمت تعیین کرد',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.courseRepository.save(course);
  }

  async favoriteCourse(courseId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favorite_courses'],
    });
    const course = await this.currentCourse(courseId);

    const isNotFavorite =
      user.favorite_courses.findIndex(
        (courseInFavorite) => courseInFavorite.id === course.id,
      ) === -1;

    if (isNotFavorite) {
      user.favorite_courses.push(course);
      course.favorites_count++;
      await this.userRepository.save(user);
      await this.courseRepository.save(course);
    }

    return course;
  }

  async deleteCourseFromFavorite(courseId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favorite_courses'],
    });
    const course = await this.currentCourse(courseId);

    const courseIndex = user.favorite_courses.findIndex(
      (courseInFavorite) => courseInFavorite.id === course.id,
    );

    if (courseIndex >= 0) {
      user.favorite_courses.splice(courseIndex, 1);
      if (course.favorites_count < 0) {
        course.favorites_count = 0;
      }
      course.favorites_count--;
      await this.userRepository.save(user);
      await this.courseRepository.save(course);
    }
    return course;
  }

  async buildCourseResponse(
    course: CourseEntity,
  ): Promise<CourseResponseInterface> {
    return { course };
  }

  async buildCourseResponses(course: CourseEntity) {
    return {
      course: {
        ...course,
      },
    };
  }
}
