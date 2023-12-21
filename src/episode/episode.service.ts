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
    episode.video_address = videoURL;
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
    const queryBuilder = this.episodeRepository.createQueryBuilder('episode');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    queryBuilder.orderBy('episode.createdAt', 'DESC');

    const episodesCount = await queryBuilder.getCount();
    const episodes = await queryBuilder.getMany();
    return { episodes, episodesCount };
  }

  async currentEpisode(id: number) {
    const episode = await this.episodeRepository.findOne({
      where: { id: id },
    });

    if (!episode) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    delete episode.chapter_id.course_id;

    return episode;
  }

  async deleteOneEpisodeWithID(
    id: number,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    const chapter = await this.currentEpisode(id);

    if (!chapter) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف قسمت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.episodeRepository.delete({ id });

    return {
      message: 'قسمت مورد نظر با موفقیت حذف شد',
    };
  }

  async updateEpisode(
    id: number,
    currentUserID: number,
    file: Express.Multer.File,
    updateEpisodeDto: UpdateEpisodeDto,
  ) {
    const episode = await this.currentEpisode(id);

    const fileAddress = join(updateEpisodeDto.fileUploadPath, file.filename);
    const videoURL = `http://localhost:3000/${fileAddress}`;

    if (!episode) {
      throw new HttpException('قسمت مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (episode.user_id !== currentUserID) {
      throw new HttpException(
        'شما مجاز به تغییر فصل نیستید',
        HttpStatus.FORBIDDEN,
      );
    }
    delete updateEpisodeDto.filename;
    delete updateEpisodeDto.fileUploadPath;
    Object.assign(episode, updateEpisodeDto);
    episode.video_address = videoURL;
    return await this.episodeRepository.save(episode);
  }

  async buildEpisodeResponse(
    episode: EpisodeEntity,
  ): Promise<EpisodeResponseInterface> {
    return { episode };
  }
}
