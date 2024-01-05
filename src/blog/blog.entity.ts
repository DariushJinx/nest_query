import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'blog' })
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  short_title: string;

  @Column()
  text: string;

  @Column()
  short_text: string;

  @Column({ default: 5 })
  blog_average_score: number;

  @Column({ type: 'json' })
  images: string[];

  @Column({ type: 'json' })
  tags: string[];

  @Column({ type: 'json' })
  tree_blog: string[];

  @Column({ type: 'json' })
  tree_blog_name: string[];

  @ManyToOne(() => BlogCategoryEntity, (category) => category.blogs, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: BlogCategoryEntity;

  @ManyToOne(() => AdminEntity, (admin) => admin.blogs, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: AdminEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.blog_id)
  comments: CommentEntity[];

  @Column({ default: 0 })
  favorites_count: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
