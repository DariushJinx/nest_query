import { ProductCategoryType } from './productCategory.types';

export interface ProductCategoriesResponseInterface {
  productCategories: ProductCategoryType[];
  productCategoriesCount: number;
}
