import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from '../product/product.entity';
import { BlogEntity } from '../blog/blog.entity';
import { UserEntity } from '../user/user.entity';
import { CourseEntity } from '../course/course.entity';

@Entity({ name: 'comment' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  show: number;

  @Column()
  comment: string;

  @Column({ enum: [1, 2, 3, 4, 5] })
  score: number;

  @Column({ default: 0 })
  parent: number;

  @Column({ default: 0 })
  is_last: number;

  @Column({ type: 'json' })
  tree_comment: string[];

  @ManyToOne(() => CourseEntity, (course) => course.comments, {
    eager: true,
  })
  @JoinColumn({ name: 'course_id' })
  course_id: CourseEntity;

  @ManyToOne(() => ProductEntity, (product) => product.comments, {
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product_id: ProductEntity;

  @ManyToOne(() => BlogEntity, (course) => course.comments, {
    eager: true,
  })
  @JoinColumn({ name: 'blog_id' })
  blog_id: BlogEntity;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user_id: UserEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
