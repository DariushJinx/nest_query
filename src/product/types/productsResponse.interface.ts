import { productType } from './product.types';

export interface ProductsResponseInterface {
  products: productType[];
  productsCount: number;
}
