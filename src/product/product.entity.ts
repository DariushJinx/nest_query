import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategoryEntity } from '../productCategory/productCategory.entity';
import { AdminEntity } from '../admin/admin.entity';
import { CommentEntity } from '../comment/comment.entity';
import { FeatureEntity } from '../features/feature.entity';

@Entity({ name: 'products' })
export class ProductEntity {
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

  @Column('bigint')
  price: number;

  @Column('bigint')
  discount: number;

  @Column('bigint')
  count: number;

  @Column({ type: 'json' })
  colors: string[];

  @Column({ type: 'json' })
  tree_product: string[];

  @Column({ type: 'json' })
  tree_product_name: string[];

  @Column({ default: 5 })
  product_average_score: number;

  @ManyToOne(() => ProductCategoryEntity, (category) => category.products, {
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategoryEntity;

  @ManyToOne(() => AdminEntity, (user) => user.products, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: AdminEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.product_id)
  comments: CommentEntity[];

  @OneToMany(() => FeatureEntity, (feature) => feature.product_id)
  features: FeatureEntity[];

  @Column({ default: 0 })
  favorites_count: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
