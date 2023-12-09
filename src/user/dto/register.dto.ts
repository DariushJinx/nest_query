import { Expose } from 'class-transformer';
import {
  IsDefined,
  Matches,
  Length,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class RegisterDto {
  @IsDefined()
  @Expose()
  @Length(3, 11, {
    message: 'تعداد کاراکترهای  یوزرنیم باید بین 3 تا 11  باشد',
  })
  username: string;
  @IsDefined()
  @Expose()
  first_name: string;
  @IsDefined()
  @Expose()
  last_name: string;
  @IsDefined()
  @Expose()
  @IsEmail()
  @Matches(
    /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
    { message: 'ایمیل وارد شده صحیح نمی باشد' },
  )
  email: string;
  @IsDefined()
  @Expose()
  password: string;
  @IsDefined()
  @Expose()
  @Matches(RegExp(/^09\d{9}$/), {
    message: 'فرمت شماره تماس وارد شده صحیح نمی باشد',
  })
  @Length(11, 11, { message: 'تعداد کاراکترهای شماره تماس باید 11 عدد باشد' })
  @IsNotEmpty({ message: 'تعداد کاراکترهای شماره تماس باید 11 عدد باشد' })
  mobile: string;
}
