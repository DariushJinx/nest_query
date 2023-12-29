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
    let getAll: string;

    getAll = `
    select ch.*,a.username as admin_username,c.title as category_title
    from chapter ch
    left join admin a on a.id = ch.user_id
    left join course c on c.id = ch.course_id
    order by ch.id desc
    `;

    if (query.limit) {
      getAll = `
    select ch.*,a.username as admin_username,c.title as category_title
    from chapter ch
    left join admin a on a.id = ch.user_id
    left join course c on c.id = ch.course_id
    order by ch.id desc
    limit ${query.limit}
    `;
    }

    if (query.offset) {
      getAll = `
    select ch.*,a.username as admin_username,c.title as category_title
    from chapter ch
    left join admin a on a.id = ch.user_id
    left join course c on c.id = ch.course_id
    order by ch.id desc
    offset ${query.offset}
    `;
    }

    if (query.register_name) {
      const register_name_split = query.register_name.split('');
      const register_name_split_join = register_name_split.join('');
      if (query.register_name.includes(register_name_split_join)) {
        getAll = `
        select ch.*,a.username as admin_username,c.title as category_title
        from chapter ch
        left join admin a on a.id = ch.user_id
        left join course c on c.id = ch.course_id
        where a.username like '%${register_name_split_join}%'
        order by ch.id desc
      `;
      }
    }

    if (query.category_title) {
      const category_title_split = query.category_title.split('');
      const category_title_split_join = category_title_split.join('');
      if (query.category_title.includes(category_title_split_join)) {
        getAll = `
      select ch.*,a.username as admin_username,c.title as category_title
      from chapter ch
      left join admin a on a.id = ch.user_id
      left join course c on c.id = ch.course_id
      where c.title like '%${category_title_split_join}%'
      order by ch.id desc
    `;
      }
    }

    const chapters = await this.courseRepository.query(getAll);

    if (!chapters.length) {
      throw new HttpException('هیچ قسمتی یافت نشد', HttpStatus.NOT_FOUND);
    }

    const chaptersCount = await this.chapterRepository.count();
    return { chapters, chaptersCount };
  }

  async currentChapter(id: number) {
    const query = `
        select ch.*,a.username as admin_username,c.title as course_title,
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
        from
        chapter as ch
        left join admin a on ch.user_id = a.id
        left join course c on c.id = ch.course_id
        where ch.id = ${id}
    `;
    const chapters = await this.chapterRepository.query(query);

    if (!chapters.length) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    const chapter = chapters[0];

    return chapter;
  }

  async deleteOneChapterWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.currentChapter(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const query = `delete from chapter where id = ${id}`;

    const removeChapter = await this.chapterRepository.query(query);

    if (removeChapter[1] === 0)
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);

    return {
      message: 'فصل مورد نظر با موفقیت حذف شد',
    };
  }

  async updateChapter(
    id: number,
    admin: AdminEntity,
    updateChapterDto: UpdateChapterDto,
  ) {
    const chapter = await this.currentChapter(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به تغییر فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    let title = chapter.title;
    if (updateChapterDto.title) title = updateChapterDto.title;

    let text = chapter.text;
    if (updateChapterDto.text) text = updateChapterDto.text;

    const updateQuery = `
    update chapter set title = '${title}', text = '${text}' where id = ${id}
    returning *`;

    const updateChapter = await this.chapterRepository.query(updateQuery);

    return updateChapter[0][0];
  }

  async buildChapterResponse(
    chapter: ChapterEntity,
  ): Promise<ChapterResponseInterface> {
    return { chapter };
  }
}
