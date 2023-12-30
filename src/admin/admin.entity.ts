import { hash } from 'bcrypt';
import { BlogEntity } from '../blog/blog.entity';
import { BlogCategoryEntity } from '../blogCategory/blogCategory.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseCategoryEntity } from '../courseCategory/courseCategory.entity';
import { CourseEntity } from '../course/course.entity';
import { ProductCategoryEntity } from '../productCategory/productCategory.entity';
import { ProductEntity } from '../product/product.entity';

@Entity({ name: 'admin' })
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  username: string;

  @Column()
  mobile: string;

  @Column({ enum: ['0', '1'], default: '0' })
  is_ban: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  @OneToMany(() => BlogCategoryEntity, (blog) => blog.register)
  blog_categories: BlogCategoryEntity[];

  @OneToMany(() => CourseCategoryEntity, (category) => category.register)
  course_categories: CourseCategoryEntity[];

  @OneToMany(() => ProductCategoryEntity, (category) => category.register)
  product_categories: ProductCategoryEntity[];

  @OneToMany(() => CourseEntity, (course) => course.teacher)
  courses: CourseEntity[];

  @OneToMany(() => ProductEntity, (product) => product.supplier)
  products: ProductEntity[];
}
