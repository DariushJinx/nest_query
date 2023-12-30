import { ProductEntity } from '../product/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from '../admin/admin.entity';

@Entity({ name: 'product_category' })
export class ProductCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'json' })
  images: string[];

  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];

  @ManyToOne(() => AdminEntity, (admin) => admin.product_categories, {
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
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
