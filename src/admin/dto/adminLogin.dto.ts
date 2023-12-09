import { Expose } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class AdminLoginDto {
  @IsDefined()
  @Expose()
  email: string;
  @IsDefined()
  @Expose()
  password: string;
}
