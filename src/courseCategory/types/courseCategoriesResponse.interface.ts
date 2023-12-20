import { CourseCategoryType } from './courseCategory.types';

export interface CourseCategoriesResponseInterface {
  courseCategories: CourseCategoryType[];
  courseCategoriesCount: number;
}
