import { BlogEntity } from '../blog/blog.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';

@Entity({ name: 'blog_category' })
export class BlogCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'json' })
  images: string[];

  @OneToMany(() => BlogEntity, (blog) => blog.category)
  blogs: BlogEntity[];

  @ManyToOne(() => AdminEntity, (admin) => admin.blog_categories, {
    eager: true,
  })
  @JoinColumn({ name: 'register_id' })
  register: AdminEntity;

  @Column({ default: 0 })
  parent: number;

  @Column({ default: 0 })
  is_last: number;

  @Column({ type: 'json' })
  tree_cat: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
