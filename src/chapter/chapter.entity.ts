import { CourseEntity } from '../course/course.entity';
import { EpisodeEntity } from '../episode/episode.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'chapter' })
export class ChapterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column()
  user_id: number;

  @ManyToOne(() => CourseEntity, (course) => course.chapters, {
    eager: true,
  })
  @JoinColumn({ name: 'course_id' })
  course_id: CourseEntity;

  @OneToMany(() => EpisodeEntity, (episode) => episode.chapter_id)
  episodes: EpisodeEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
