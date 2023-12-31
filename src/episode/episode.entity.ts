import { ChapterEntity } from '../chapter/chapter.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'episode' })
export class EpisodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  text: string;

  @Column({ default: 'unlock' })
  type: string;

  @Column()
  time: string;

  @Column()
  video_address: string;

  @Column()
  user_id: number;

  @ManyToOne(() => ChapterEntity, (chapter) => chapter.episodes, {
    eager: true,
  })
  @JoinColumn({ name: 'chapter_id' })
  chapter_id: ChapterEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
