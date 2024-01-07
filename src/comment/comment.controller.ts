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
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from '../decorators/user.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { Admin } from '../decorators/admin.decorators';
import { AdminEntity } from '../admin/admin.entity';
import { AuthGuard } from '../guards/auth.guard';
import { BackendValidationPipe } from '../pipes/backendValidation.pipe';
import { AdminAuthGuard } from '../guards/adminAuth.guard';
import { AuthBothGuard } from '../guards/bothAuth.guard';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('add')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createCourse(
    @User() currentUser: UserEntity,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentService.createComment(
      currentUser,
      createCommentDto,
    );
    return await this.commentService.buildCommentResponse(comment);
  }

  @Get('list')
  async findAllComments(
    @Query() query: any,
  ): Promise<CommentsResponseInterface> {
    return await this.commentService.findAllComments(query);
  }

  @Get('tree_comment')
  @UseGuards(AdminAuthGuard)
  async reIndexTreeComment(@Admin() admin: AdminEntity) {
    return await this.commentService.reIndexTreeComment(admin);
  }

  @Get('parents')
  async getParents() {
    return await this.commentService.getParents();
  }

  @Get(':id')
  async getOneComment(
    @Param('id') id: number,
  ): Promise<CommentResponseInterface> {
    const comment = await this.commentService.currentComment(id);
    return await this.commentService.buildCommentResponses(comment);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateOneCommentWithId(
    @Param('id') id: number,
    @Admin() admin: AdminEntity,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseInterface> {
    const comment = await this.commentService.updateComment(
      id,
      admin,
      updateCommentDto,
    );
    return await this.commentService.buildCommentResponse(comment);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @UsePipes(new BackendValidationPipe())
  async showComment(@Param('id') id: number, @Admin() admin: AdminEntity) {
    const comment = await this.commentService.showComment(id, admin);

    return comment;
  }

  @Delete(':id')
  @UseGuards(AuthBothGuard)
  async deleteOneProduct(
    @Param('id') id: number,
    @User() user: UserEntity,
    @Admin() admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.commentService.deleteOneComment(id, user, admin);

    return {
      message: 'کامنت مورد نظر با موفقیت حذف شد',
    };
  }
}
