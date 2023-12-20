import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';

@Entity({ name: 'course_category' })
export class CourseCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'json' })
  images: string[];

  @ManyToOne(() => AdminEntity, (admin) => admin.course_categories, {
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
