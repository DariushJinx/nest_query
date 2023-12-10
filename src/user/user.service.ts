import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';
import { UserResponseInterface } from './types/userResponse.interface';
import { AdminEntity } from 'src/admin/admin.entity';
import { UserBanResponseInterface } from './types/userBanResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async registerUser(registerDto: RegisterDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {},
    };

    const userByEmail = await this.userRepository.findOne({
      select: {
        email: true,
      },
      where: {
        email: registerDto.email,
      },
    });

    const userByUsername = await this.userRepository.findOne({
      select: {
        username: true,
      },
      where: {
        username: registerDto.username,
      },
    });

    const userByMobile = await this.userRepository.findOne({
      select: {
        mobile: true,
      },
      where: {
        mobile: registerDto.mobile,
      },
    });

    if (userByEmail) {
      errorResponse.errors['email'] = 'ایمیل وارد شده از قبل موجود می باشد';
    }

    if (userByMobile) {
      errorResponse.errors['mobile'] =
        'شماره تماس وارد شده از قبل موجود می باشد';
    }

    if (userByUsername) {
      errorResponse.errors['username'] =
        'نام کاربری وارد شده از قبل موجود می باشد';
    }

    if (userByEmail || userByUsername || userByMobile) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    newUser.isBan = '0';
    if (newUser.isBan === '1') {
      throw new HttpException(
        'شماره تماس وارد شده مسدود می باشد',
        HttpStatus.FORBIDDEN,
      );
    }
    Object.assign(newUser, registerDto);
    const user = await this.userRepository.save(newUser);

    delete user.password;

    return user;
  }

  async loginUser(loginDto: LoginDto) {
    const errorResponse = {
      errors: {},
    };

    const query = `select email,password from users where email = '${loginDto.email}' limit 1`;

    const users = await this.userRepository.query(query);
    const user = users[0];

    if (!user) {
      errorResponse.errors['user'] =
        'ایمیل و یا رمز عبور وارد شده صحیح نمی باشد';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (user.isBan === '1') {
      throw new HttpException(
        'شماره تماس وارد شده مسدود می باشد',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordCorrect = await compare(loginDto.password, user.password);

    if (!isPasswordCorrect) {
      errorResponse.errors['user'] =
        'ایمیل و یا رمز عبور وارد شده صحیح نمی باشد';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    delete user.password;
    return user;
  }

  async banUser(admin: AdminEntity, id: number) {
    const query = `select * from users where id = ${id}`;

    const users = await this.userRepository.query(query);

    const user = users[0];

    if (!user) {
      throw new HttpException('کاربر مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (!admin) {
      throw new HttpException(
        'شما مجاز به بن کردن کاربر نمی باشید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.isBan === '1') {
      throw new HttpException(
        'کاربر مورد نظر مسدود می باشد',
        HttpStatus.NOT_FOUND,
      );
    }

    user.isBan = '1';

    await this.userRepository.save(user);
    delete user.password;

    return user;
  }

  async userList(admin: AdminEntity, query: any) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این بخش نیستید',
        HttpStatus.NOT_FOUND,
      );
    }

    let findAll: string;

    findAll = `select * from users order by id desc`;

    if (query.search) {
      findAll = `select * from users where username = '${query.search}'`;
    }

    if (query.limit) {
      findAll = `select * from users limit ${query.limit}`;
    }

    if (query.offset) {
      findAll = `select * from users offset ${query.offset}`;
    }

    const users = await this.userRepository.query(findAll);
    const usersCount = await this.userRepository.count();

    users.forEach((user: UserEntity) => {
      delete user.password;
    });

    return { users, usersCount };
  }

  async findByID(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { email: email },
    });
  }

  generateJwtToken(user: UserEntity): string {
    const options = {
      expiresIn: '30d',
    };
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET_KEY,
      options,
    );
  }

  async buildBanAdminResponse(
    user: UserEntity,
  ): Promise<UserBanResponseInterface> {
    return {
      user: {
        ...user,
      },
    };
  }

  async buildUserResponse(user: UserEntity): Promise<UserResponseInterface> {
    return {
      user: {
        ...user,
        token: this.generateJwtToken(user),
      },
    };
  }

  async buildUserResponses(user: UserEntity) {
    delete user.password;
    return {
      users: [{ ...user }],
    };
  }
}
