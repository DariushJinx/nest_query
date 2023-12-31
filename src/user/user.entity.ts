import { hash } from 'bcrypt';
import { BlogEntity } from '../blog/blog.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseEntity } from '../course/course.entity';
import { ProductEntity } from '../product/product.entity';
import { CommentEntity } from '../comment/comment.entity';

@Entity({ name: 'users' })
export class UserEntity {
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

  @ManyToMany(() => BlogEntity)
  @JoinTable({
    name: 'users_blogs',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'blog_id', referencedColumnName: 'id' }],
  })
  blog_bookmarks: BlogEntity[];

  @ManyToMany(() => ProductEntity)
  @JoinTable({
    name: 'users_products',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'product_id', referencedColumnName: 'id' }],
  })
  products_bookmarks: ProductEntity[];

  @ManyToMany(() => CourseEntity)
  @JoinTable({
    name: 'users_courses',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'course_id', referencedColumnName: 'id' }],
  })
  favorite_courses: CourseEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user_id)
  comments: CommentEntity[];
}
