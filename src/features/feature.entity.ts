import { ProductEntity } from '../product/product.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'feature' })
export class FeatureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => ProductEntity, (product) => product.features, {
    eager: true,
  })
  @JoinColumn({ name: 'product_id' })
  product_id: ProductEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
