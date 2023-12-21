import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CreateChapterDto } from './dto/createChpater.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';
import { AdminEntity } from 'src/admin/admin.entity';
import { ChapterEntity } from './chapter.entity';
import { CourseEntity } from 'src/course/course.entity';
import { ChaptersResponseInterface } from './types/chaptersResponse.interface';
import { ChapterResponseInterface } from './types/chpaterResponse.interface';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async createChapter(
    createChapterDto: CreateChapterDto,
    admin: AdminEntity,
  ): Promise<ChapterEntity> {
    const course = await this.courseRepository.findOne({
      where: { id: +createChapterDto.course_id },
    });

    if (!course) {
      throw new HttpException('دوره مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const chapter = new ChapterEntity();
    Object.assign(chapter, createChapterDto);

    chapter.user_id = admin.id;
    if (course.teacher.id !== chapter.user_id) {
      throw new HttpException(
        'شما مجاز به ثبت فصل برای این دوره نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.chapterRepository.save(chapter);
  }

  async findAllChapters(query: any): Promise<ChaptersResponseInterface> {
    const queryBuilder = this.chapterRepository.createQueryBuilder('chapter');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('chapter.createdAt', 'DESC');

    const chaptersCount = await queryBuilder.getCount();
    const chapters = await queryBuilder.getMany();
    return { chapters, chaptersCount };
  }

  async currentChapter(id: number) {
    const chapter = await this.chapterRepository.findOne({
      where: { id: id },
      relations: ['episodes'],
    });

    if (!chapter) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    delete chapter.course_id;
    chapter.episodes.map((episode) => delete episode.chapter_id);

    return chapter;
  }

  async deleteOneChapterWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    const chapter = await this.currentChapter(id);

    if (!chapter) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.chapterRepository.delete({ id });

    return {
      message: 'فصل مورد نظر با موفقیت حذف شد',
    };
  }

  async updateChapter(
    id: number,
    adminID: number,
    updateChapterDto: UpdateChapterDto,
  ) {
    const chapter = await this.currentChapter(id);

    if (!chapter) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (chapter.user_id !== adminID) {
      throw new HttpException(
        'شما مجاز به تغییر فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(chapter, updateChapterDto);

    return await this.chapterRepository.save(chapter);
  }

  async buildChapterResponse(
    chapter: ChapterEntity,
  ): Promise<ChapterResponseInterface> {
    return { chapter };
  }
}
