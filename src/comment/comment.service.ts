import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserEntity } from '../user/user.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentEntity } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import { AdminEntity } from '../admin/admin.entity';
import { UpdateCommentDto } from './dto/updateComment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async createComment(
    currentUser: UserEntity,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    if (
      !createCommentDto.blog_id &&
      !createCommentDto.course_id &&
      !createCommentDto.product_id
    ) {
      throw new HttpException(
        'هر کدوم از موارد مربوط به بلاگ یا محصول و یا دوره مورد نیاز می باشد',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newComment = new CommentEntity();

    Object.assign(newComment, createCommentDto);

    newComment.user_id = currentUser;

    newComment.tree_comment = [];

    delete newComment.user_id.password;

    const saveComment = await this.commentRepository.save(newComment);

    const comments = await this.commentRepository.find();

    comments.forEach(async (comment: any) => {
      if (newComment.parent && newComment.parent !== 0) {
        let parentCode = newComment.parent.toString();
        newComment.tree_comment = [newComment.id.toString(), parentCode];
        let parent = comments.find((item) => item.id.toString() === parentCode);
        while (parent && parent.parent !== 0) {
          parentCode = parent.parent.toString();
          newComment.tree_comment.push(parentCode);
          parent = comments.find((item) => item.id.toString() === parentCode);
        }
      } else {
        newComment.tree_comment = [newComment.id.toString()];
      }
      await this.commentRepository.update(
        { id: comment.id },
        { tree_comment: comment.tree_comment },
      );
      await this.commentRepository.save(saveComment);
    });

    return saveComment;
  }

  async findAllComments(query: any): Promise<CommentsResponseInterface> {
    let getAll: string;

    getAll = `
        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
    `;

    if (query.user_name) {
      const user_name_split = query.user_name.split('');
      const user_name_split_join = user_name_split.join('');
      if (query.user_name.includes(user_name_split_join)) {
        getAll = `
          select c.*,
          u.username as username,
          b.title as blog_title,
          co.title as course_title,
          p.title as product_title
          from comment c
          left join blog b on b.id = c.blog_id
          left join course co on co.id = c.course_id
          left join products p on p.id = c.product_id
          left join users u on u.id = c.user_id
          where u.username like '%${user_name_split_join}%'
          order by c.id desc
        `;
      }
    }

    if (query.blog_title) {
      const blog_title_split = query.blog_title.split('');
      const blog_title_split_join = blog_title_split.join('');
      if (query.blog_title.includes(blog_title_split_join)) {
        getAll = `
        select c.*,
        u.username as username,
        b.title as blog_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join users u on u.id = c.user_id
        where b.title like '%${blog_title_split_join}%'
        order by c.id desc
        `;
      }
    }

    if (query.course_title) {
      const course_title_split = query.course_title.split('');
      const course_title_split_join = course_title_split.join('');
      if (query.course_title.includes(course_title_split_join)) {
        getAll = `
        select c.*,
        u.username as username,
        co.title as course_title
        from comment c
        left join course co on co.id = c.course_id
        left join users u on u.id = c.user_id
        where co.title like '%${course_title_split_join}%'
        order by c.id desc
        `;
      }
    }

    if (query.product_title) {
      const product_title_split = query.product_title.split('');
      const product_title_split_join = product_title_split.join('');
      if (query.product_title.includes(product_title_split_join)) {
        getAll = `
        select c.*,
        u.username as username,
        p.title as product_title
        from comment c
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        where p.title like '%${product_title_split_join}%'
        order by c.id desc
        `;
      }
    }

    if (query.limit) {
      getAll = `
        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
        limit ${query.limit}
      `;
    }

    if (query.offset) {
      getAll = `
        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
        offset ${query.offset}
      `;
    }

    if (query.offset && query.limit) {
      getAll = `
        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
        offset ${query.offset}
        limit ${query.limit}
      `;
    }

    const comments = await this.commentRepository.query(getAll);

    if (!comments.length) {
      throw new HttpException('هیچ کامنتی یافت نشد', HttpStatus.BAD_REQUEST);
    }

    const commentsCount = await this.commentRepository.count();

    return { comments, commentsCount };
  }

  async reIndexTreeComment(admin: AdminEntity) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این قسمت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const getAll = `
        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        order by c.id desc
    `;

    const comments = await this.commentRepository.query(getAll);

    if (!comments.length) {
      throw new HttpException('هیچ کامنتی یافت نشد', HttpStatus.BAD_REQUEST);
    }

    comments.forEach(async (item) => {
      item.tree_comment = [];

      if (item.parent && item.parent !== 0) {
        let parentId = item.parent.toString();
        const commentId = item.id.toString();
        item.tree_comment = [commentId, parentId];
        let parent = comments.find((li) => li.id.toString() === parentId);
        while (parent && parent.parent !== 0) {
          parentId = parent.parent.toString();
          item.tree_comment.push(parentId);
          parent = comments.find((li) => li.id.toString() === parentId);
        }
      } else {
        item.tree_comment = [item.id.toString()];
      }
    });
    comments.forEach(async (item) => {
      await this.commentRepository.update(
        { id: item.id },
        {
          tree_comment: item.tree_comment,
        },
      );
    });

    return comments;
  }

  async getParents() {
    let comments: any;
    await this.commentRepository
      .find({
        where: { parent: 0 },
      })
      .then((data) => {
        return data.sort((a: any, b: any) => a.id - b.id);
      })
      .then((finalData) => {
        comments = finalData;
      });

    return comments;
  }

  async currentComment(id: number): Promise<CommentEntity> {
    const query = `
        select c.*,
        u.username as username,
        b.title as blog_title,
        co.title as course_title,
        p.title as product_title
        from comment c
        left join blog b on b.id = c.blog_id
        left join course co on co.id = c.course_id
        left join products p on p.id = c.product_id
        left join users u on u.id = c.user_id
        where c.id = ${id}
    `;

    const comments = await this.commentRepository.query(query);

    if (!comments.length) {
      throw new HttpException('کامنتی یافت نشد', HttpStatus.NOT_FOUND);
    }

    const comment = comments[0];

    return comment;
  }

  async updateComment(
    id: number,
    admin: AdminEntity,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.currentComment(id);

    if (!admin) {
      throw new HttpException('شما مجاز نیستید', HttpStatus.FORBIDDEN);
    }

    let update_comment = comment.comment;
    if (updateCommentDto.comment) update_comment = updateCommentDto.comment;

    let update_score = comment.score;
    if (updateCommentDto.score) update_score = updateCommentDto.score;

    const query = `
    update comment set
    comment = '${update_comment}',
    score = ${update_score},
    show = 0
    where id = ${id}
    returning *
    `;

    const updateComment = await this.commentRepository.query(query);

    return updateComment[0][0];
  }

  async deleteOneComment(
    id: number,
    user: UserEntity,
    admin: AdminEntity,
  ): Promise<{
    message: string;
  }> {
    await this.currentComment(id);

    if (user) {
      if (!user) {
        throw new HttpException(
          'شما مجاز به حذف کامنت نیستید',
          HttpStatus.FORBIDDEN,
        );
      }

      const query = `delete from comment where id = ${id}`;

      const removeCourse = await this.commentRepository.query(query);

      if (removeCourse[1] === 0)
        throw new HttpException(
          'کامنت مورد نظر یافت نشد',
          HttpStatus.NOT_FOUND,
        );

      return {
        message: 'کامنت مورد نظر با موفقیت حذف شد',
      };
    } else if (admin) {
      if (!admin) {
        throw new HttpException(
          'شما مجاز به حذف کامنت نیستید',
          HttpStatus.FORBIDDEN,
        );
      }

      const query = `delete from comment where id = ${id}`;

      const removeCourse = await this.commentRepository.query(query);

      if (removeCourse[1] === 0)
        throw new HttpException(
          'کامنت مورد نظر یافت نشد',
          HttpStatus.NOT_FOUND,
        );

      return {
        message: 'کامنت مورد نظر با موفقیت حذف شد',
      };
    }
  }

  async showComment(id: number, admin: AdminEntity) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این قسمت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.currentComment(id);

    if (!admin) {
      throw new HttpException(
        'شما مجاز به نمایش کامنت نیستید',
        HttpStatus.FORBIDDEN,
      );
    }

    const query = `
    update comment set
    show = 1
    where id = ${id}
    returning *
    `;

    const updateComment = await this.commentRepository.query(query);

    return updateComment[0][0];
  }

  async buildCommentResponse(
    comment: CommentEntity,
  ): Promise<CommentResponseInterface> {
    return { comment };
  }

  async buildCommentResponses(comment: CommentEntity) {
    return {
      comment: {
        ...comment,
      },
    };
  }
}
