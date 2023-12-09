import { Expose } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @Expose()
  email: string;
  @IsDefined()
  @Expose()
  password: string;
}
