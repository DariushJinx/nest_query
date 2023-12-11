import { BlogCategoryType } from './BlogCategory.types';

export interface BlogCategoriesResponseInterface {
  blogCategories: BlogCategoryType[];
  blogCategoriesCount: number;
}
