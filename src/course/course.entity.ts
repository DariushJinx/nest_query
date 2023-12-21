import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseCategoryEntity } from '../courseCategory/courseCategory.entity';
import { AdminEntity } from '../admin/admin.entity';
import { ChapterEntity } from '../chapter/chapter.entity';

export enum typeEnum {
  FREE = 'free',
  CASH = 'cash',
  SPECIAL = 'special',
}

export enum statusEnum {
  NOT_STARTED = 'not_started',
  COMPLETED = 'completed',
  HOLDING = 'holding',
}

@Entity({ name: 'course' })
export class CourseEntity {
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

  @Column({ type: 'json' })
  images: string[];

  @Column({ type: 'json' })
  tags: string[];

  @Column({ type: 'json' })
  tree_course: string[];

  @Column({ type: 'json' })
  tree_course_name: string[];

  @Column({ default: 0 })
  price: number;

  @Column({ default: 0 })
  discount: number;

  @Column({ default: typeEnum.FREE, type: 'enum', enum: typeEnum })
  type: typeEnum;

  @Column({ default: 5 })
  course_average_score: number;

  @Column({ default: statusEnum.NOT_STARTED, type: 'enum', enum: statusEnum })
  status: statusEnum;

  @ManyToOne(() => CourseCategoryEntity, (category) => category.courses, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: CourseCategoryEntity;

  @OneToMany(() => ChapterEntity, (chapter) => chapter.course_id)
  chapters: ChapterEntity[];

  @ManyToOne(() => AdminEntity, (admin) => admin.courses, { eager: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: AdminEntity;

  @Column({ default: 0 })
  favorites_count: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
