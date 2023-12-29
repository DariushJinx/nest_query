import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { FunctionUtils } from '../utils/functions.utils';
import getVideoDurationInSeconds from 'get-video-duration';
import { EpisodeEntity } from './episode.entity';
import { EpisodesResponseInterface } from './types/episodesResponse.interface';
import { UpdateEpisodeDto } from './dto/updateEpisode.dto';
import { EpisodeResponseInterface } from './types/episodeResponse.interface';
import { CreateEpisodeDto } from './dto/createEpisode.dto';
import { AdminEntity } from '../admin/admin.entity';
import { ChapterEntity } from '../chapter/chapter.entity';

@Injectable()
export class EpisodeService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepository: Repository<ChapterEntity>,
  ) {}

  async createEpisode(
    createEpisodeDto: CreateEpisodeDto,
    admin: AdminEntity,
    file: Express.Multer.File,
  ) {
    const chapter = await this.chapterRepository.findOne({
      where: { id: +createEpisodeDto.chapter_id },
    });

    if (!chapter) {
      throw new HttpException('فصل مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    const episode = new EpisodeEntity();
    const fileAddress = join(createEpisodeDto.fileUploadPath, file.filename);
    const videoURL = `http://localhost:3000/${fileAddress}`;
    const duration = await getVideoDurationInSeconds(videoURL);
    const time = FunctionUtils.getTime(duration);
    delete createEpisodeDto.filename;
    delete createEpisodeDto.fileUploadPath;
    Object.assign(episode, createEpisodeDto);
    episode.time = time;
    episode.video_address = videoURL
      .replace('\\', '/')
      .replace('\\', '/')
      .replace('\\', '/')
      .replace('\\', '/')
      .replace('\\', '/');
    episode.user_id = admin.id;
    if (chapter.course_id.teacher.id !== episode.user_id) {
      throw new HttpException(
        'شما مجاز به ثبت قسمت برای این فصل نیستید',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.episodeRepository.save(episode);
  }

  async findAllEpisodes(query: any): Promise<EpisodesResponseInterface> {
    let findAll: string;

    findAll = `
    select e.*,a.username as register_name,ch.title as chapter_title
    from episode e
    left join admin a on e.user_id = a.id
    left join chapter ch on ch.id = e.chapter_id
    order by id desc
    `;

    if (query.limit) {
      findAll = `
    select e.*,a.username as register_name,ch.title as chapter_title
    from episode e
    left join admin a on e.user_id = a.id
    left join chapter ch on ch.id = e.chapter_id
    order by id desc
    limit ${query.limit}
    `;
    }

    if (query.offset) {
      findAll = `
    select e.*,a.username as register_name,ch.title as chapter_title
    from episode e
    left join admin a on e.user_id = a.id
    left join chapter ch on ch.id = e.chapter_id
    order by id desc
    offset ${query.offset}
    `;
    }

    if (query.offset && query.limit) {
      findAll = `
    select e.*,a.username as register_name,ch.title as chapter_title
    from episode e
    left join admin a on e.user_id = a.id
    left join chapter ch on ch.id = e.chapter_id
    order by id desc
    offset ${query.offset}
    limit ${query.limit}
    `;
    }

    if (query.start && query.end) {
      const start_split = query.start.split('');
      const start_split_join = start_split.join('');
      const end_split = query.end.split('');
      const end_split_join = end_split.join('');
      if (
        query.start.includes(start_split_join) &&
        query.end.includes(end_split_join)
      ) {
        findAll = `
        select e.*,a.username as register_name,ch.title as chapter_title
        from episode e
        left join admin a on e.user_id = a.id
        left join chapter ch on ch.id = e.chapter_id
        where e.time >= '${query.start}' and e.time <= '${query.end}'
        order by id desc
      `;
      }
    }

    if (query.register_name) {
      const register_name_split = query.register_name.split('');
      const register_name_split_join = register_name_split.join('');
      if (query.register_name.includes(register_name_split_join)) {
        findAll = `
      select e.*,a.username as register_name,ch.title as chapter_title
      from episode e
      left join admin a on e.user_id = a.id
      left join chapter ch on ch.id = e.chapter_id
      where a.username like '%${register_name_split_join}%'
      order by id desc
    `;
      }
    }

    if (query.chapter_title) {
      const chapter_title_split = query.chapter_title.split('');
      const chapter_title_split_join = chapter_title_split.join('');
      if (query.chapter_title.includes(chapter_title_split_join)) {
        findAll = `
      select e.*,a.username as register_name,ch.title as chapter_title
      from episode e
      left join admin a on e.user_id = a.id
      left join chapter ch on ch.id = e.chapter_id
      where ch.title like '%${chapter_title_split_join}%'
      order by id desc
    `;
      }
    }

    const episodes = await this.episodeRepository.query(findAll);

    if (!episodes.length) {
      throw new HttpException('هیچ قسمتی یافت نشد', HttpStatus.NOT_FOUND);
    }

    const episodesCount = await this.episodeRepository.count();
    return { episodes, episodesCount };
  }

  async currentEpisode(id: number) {
    const query = `
    select e.*,a.username as register_name,ch.title as chapter_title
    from episode e
    left join admin a on e.user_id = a.id
    left join chapter ch on ch.id = e.chapter_id
    where e.id = ${id}
    `;

    const episodes = await this.episodeRepository.query(query);

    const episode = episodes[0];

    if (!episode) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    return episode;
  }

  async deleteOneEpisodeWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.currentEpisode(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف قسمت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const query = `
    delete from episode where id = ${id}
    `;

    await this.episodeRepository.query(query);

    return {
      message: 'قسمت مورد نظر با موفقیت حذف شد',
    };
  }

  async updateEpisode(
    id: number,
    admin: AdminEntity,
    file: Express.Multer.File,
    updateEpisodeDto: UpdateEpisodeDto,
  ) {
    const episode = await this.currentEpisode(id);
    let fileAddress;
    if (updateEpisodeDto.fileUploadPath && file.filename) {
      fileAddress = join(updateEpisodeDto.fileUploadPath, file.filename);
    }
    const videoURL = `http://localhost:3000/${fileAddress}`;

    if (!admin) {
      throw new HttpException(
        'شما مجاز به تغییر فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    let title = episode.title;
    if (updateEpisodeDto.title) title = updateEpisodeDto.title;

    let text = episode.text;
    if (updateEpisodeDto.text) text = updateEpisodeDto.text;

    let type = episode.type;
    if (updateEpisodeDto.type) type = updateEpisodeDto.type;

    const update_query = `
    update episode set
    title = '${title}', text = '${text}', type = '${type}'
    where id = ${id}
    returning *
    `;
    if (updateEpisodeDto.fileUploadPath && file.filename) {
      episode.video_address = videoURL
        .replace('\\', '/')
        .replace('\\', '/')
        .replace('\\', '/')
        .replace('\\', '/')
        .replace('\\', '/');
    }
    const episodeResult = await this.episodeRepository.query(update_query);

    return episodeResult[0][0];
  }

  async buildEpisodeResponse(
    episode: EpisodeEntity,
  ): Promise<EpisodeResponseInterface> {
    return { episode };
  }
}
