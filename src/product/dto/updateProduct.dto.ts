import { Expose } from 'class-transformer';
import { Allow, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @Expose()
  title: string;
  @Expose()
  short_title: string;
  @Expose()
  text: string;
  @Expose()
  short_text: string;
  @IsOptional()
  @Expose()
  tags: string[];
  @Expose()
  price: number;
  @Expose()
  discount: number;
  @Expose()
  count: number;
  @IsOptional()
  @Expose()
  colors: string[];
  @IsOptional()
  @Expose()
  filename: string;
  @Allow()
  fileUploadPath: string;
}
