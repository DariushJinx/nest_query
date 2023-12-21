import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EpisodeService } from './episode.service';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminEntity } from 'src/admin/admin.entity';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { multerConfig } from 'src/middlewares/multer.middleware';
import { CreateEpisodeDto } from './dto/createEpisode.dto';
import { EpisodesResponseInterface } from './types/episodesResponse.interface';
import { EpisodeResponseInterface } from './types/episodeResponse.interface';
import { UpdateEpisodeDto } from './dto/updateEpisode.dto';

@Controller('episode')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async createEpisode(
    @Admin() admin: AdminEntity,
    @UploadedFile() file: Express.Multer.File,
    @Body() createEpisodeDto: CreateEpisodeDto,
  ) {
    const episode = await this.episodeService.createEpisode(
      createEpisodeDto,
      admin,
      file,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }

  @Get('list')
  async findAllEpisodes(
    @Query() query: any,
  ): Promise<EpisodesResponseInterface> {
    return await this.episodeService.findAllEpisodes(query);
  }

  @Get(':id')
  async getOneEpisode(
    @Param('id') id: number,
  ): Promise<EpisodeResponseInterface> {
    const episode = await this.episodeService.currentEpisode(id);
    return await this.episodeService.buildEpisodeResponse(episode);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneEpisode(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.episodeService.deleteOneEpisodeWithID(id, admin);

    return {
      message: 'قسمت مورد نظر با موفقیت حذف شد',
    };
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('video', multerConfig))
  async updateOneEpisodeWithId(
    @Param('id') id: number,
    @Admin('id') adminID: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('') updateEpisodeDto: UpdateEpisodeDto,
  ): Promise<EpisodeResponseInterface> {
    const episode = await this.episodeService.updateEpisode(
      id,
      adminID,
      file,
      updateEpisodeDto,
    );
    return await this.episodeService.buildEpisodeResponse(episode);
  }
}
