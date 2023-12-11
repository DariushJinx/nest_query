import { blogType } from './blog.types';

export interface BlogsResponseInterface {
  blogs: blogType[];
  blogsCount: number;
}
