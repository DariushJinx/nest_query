import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ChapterService } from './chpater.service';
import { CreateChapterDto } from './dto/createChpater.dto';
import { UpdateChapterDto } from './dto/updateChapter.dto';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { ChaptersResponseInterface } from './types/chaptersResponse.interface';
import { ChapterResponseInterface } from './types/chpaterResponse.interface';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post('add')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createChapter(
    @Admin() admin: AdminEntity,
    @Body() createChapterDto: CreateChapterDto,
  ) {
    const chapter = await this.chapterService.createChapter(
      createChapterDto,
      admin,
    );
    return await this.chapterService.buildChapterResponse(chapter);
  }

  @Get('list')
  async findAllChapters(
    @Query() query: any,
  ): Promise<ChaptersResponseInterface> {
    return await this.chapterService.findAllChapters(query);
  }

  @Get(':id')
  async getOneChapter(
    @Param('id') id: number,
  ): Promise<ChapterResponseInterface> {
    const chapter = await this.chapterService.currentChapter(id);
    return await this.chapterService.buildChapterResponse(chapter);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  async deleteOneChapter(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.chapterService.deleteOneChapterWithID(id, admin);

    return {
      message: 'دوره مورد نظر با موفقیت حذف شد',
    };
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneChapterWithId(
    @Param('id') id: number,
    @Admin('id') AdminID: number,
    @Body('') updateChapterDto: UpdateChapterDto,
  ): Promise<ChapterResponseInterface> {
    const chapter = await this.chapterService.updateChapter(
      id,
      AdminID,
      updateChapterDto,
    );
    return await this.chapterService.buildChapterResponse(chapter);
  }
}
