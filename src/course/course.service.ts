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
        where: { id: Number(item) },
      });

      course.tree_course_name.push(category.title);
      course.tree_course = courseCategories.tree_cat;
      await this.courseRepository.save(course);
    });

    return await this.courseRepository.save(saveCourse);
  }

  async findAllCourses(query: any): Promise<CoursesResponseInterface> {
    let findAll: string;
    findAll = `select c.*,
    cc.title as category_title,
    a.username as teacher_username
    from
    course as c
    left join course_category cc on c.category_id = cc.id
    left join admin a on c.teacher_id = a.id
    order by c.id desc`;

    if (query.search) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      where c.title = '${query.search}'
      or cc.title = '${query.search}'
      or a.username = '${query.search}'
      order by c.id desc`;
    }

    if (query.type) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      where c.type = '${query.type}'
      order by c.id desc`;
    }

    if (query.first_price && query.second_price) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      where c.price between '${query.first_price}' and '${query.second_price}'
      order by c.id desc`;
    }

    if (query.tag) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      where c.tags = '${query.tag}'
      order by c.id desc`;
    }

    if (query.teacher) {
      const queryTeacher = `select * from admin where username='${query.teacher}'`;
      const teacher = await this.adminRepository.query(queryTeacher);

      if (!teacher.length) {
        throw new HttpException(
          'دوره ای با این مشخصات یافت نشد',
          HttpStatus.UNAUTHORIZED,
        );
      }

      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      where a.username = '${query.teacher}'
      order by c.id desc`;
    }

    if (query.limit) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      order by c.id desc
      limit ${query.limit}`;
    }

    if (query.offset) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      order by c.id desc
      offset ${query.offset}`;
    }

    if (query.offset && query.limit) {
      findAll = `select c.*,
      cc.title as category_title,
      a.username as teacher_username
      from
      course as c
      left join course_category cc on c.category_id = cc.id
      left join admin a on c.teacher_id = a.id
      order by c.id desc
      limit ${query.limit}
      offset ${query.offset}`;
    }

    const courses = await this.courseRepository.query(findAll);

    if (!courses.length) {
      throw new HttpException('هیچ دوره ای یافت نشد', HttpStatus.BAD_REQUEST);
    }
    const coursesCount = await this.courseRepository.count();

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
    const query = `
    select c.*,
    a.username as teacher_name,
    cc.title as category_title,
    coalesce(
    (
        select array_to_json(array_agg(row_to_json(t)))
        from (
            select ch.id,ch.title,ch.text, 
            coalesce(
            (
            select array_to_json(array_agg(row_to_json(t)))
            from (
                select
                e.id,e.title,e.text,e.type,
                e.time,e.video_address
                from episode e
                where e.chapter_id = ch.id
            ) t
            ),
            '[]'::json
            ) as episodes
            from chapter ch
            where ch.course_id = c.id
        ) t
    ),
    '[]'::json
    ) as chapters
    from
    course as c
    left join admin a on c.teacher_id = a.id
    left join course_category cc on cc.id = c.category_id
    where c.id = ${id}`;
    const course = await this.courseRepository.query(query);

    if (!course.length) {
      throw new HttpException('هیچ دوره ای یافت نشد', HttpStatus.BAD_REQUEST);
    }

    return course[0];
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
    await this.currentCourse(id);

    const query = `delete from blog where id = ${id}`;

    const removeCourse = await this.courseRepository.query(query);

    if (removeCourse[1] === 0)
      throw new HttpException('دوره مورد نظر یافت نشد', HttpStatus.NOT_FOUND);

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

    let title = course.title;
    if (updateCourseDto.title) title = updateCourseDto.title;
    let short_title = course.short_title;
    if (updateCourseDto.short_title) short_title = updateCourseDto.short_title;
    let text = course.text;
    if (updateCourseDto.text) text = updateCourseDto.text;
    let short_text = course.short_text;
    if (updateCourseDto.short_text) short_text = updateCourseDto.short_text;
    let price = course.price;
    if (updateCourseDto.price) price = updateCourseDto.price;
    let discount = course.discount;
    if (updateCourseDto.discount) discount = updateCourseDto.discount;
    let type = course.type;
    if (updateCourseDto.type) type = updateCourseDto.type;

    const query = `UPDATE course SET title = '${title}', short_title = '${short_title}',
    text = '${text}',
    short_text = '${short_text}',
    price = ${price},
    discount = '${discount}',
    type = '${type}'
    where id = ${id} RETURNING *`;

    const result = await this.courseRepository.query(query);

    if (images.length > 0) {
      result[0][0].images = images;
      await this.courseRepository.save(result[0][0]);
    }

    return result[0][0];
  }

  async favoriteCourse(courseId: number, currentUser: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser },
      relations: ['favorite_courses'],
    });

    const course = await this.currentCourse(courseId);

    let favorite: any;

    user.favorite_courses.map((courseInFavorite) => {
      favorite = courseInFavorite.id;
    });

    const isNotFavorite =
      user.favorite_courses.findIndex((courseInFavorite) => {
        courseInFavorite.id === course.id;
      }) === -1;

    if (isNotFavorite) {
      if (favorite === course.id) {
        throw new HttpException(
          'دوره شما از قبل در لیست علاقه مندی ها موجود می باشد',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        user.favorite_courses.push(course);
        course.favorites_count++;
        await this.userRepository.save(user);
        await this.courseRepository.save(course);
      }
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
