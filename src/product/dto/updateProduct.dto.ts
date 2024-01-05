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
  @Expose()
  price: number;
  @Expose()
  discount: number;
  @Expose()
  count: number;
  @IsOptional()
  @Expose()
  filename: string;
  @Allow()
  fileUploadPath: string;
}
