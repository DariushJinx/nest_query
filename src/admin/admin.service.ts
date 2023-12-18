import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY } from 'src/config';
import { AdminEntity } from './admin.entity';
import { AdminRegisterDto } from './dto/adminRegister.dto';
import { AdminLoginDto } from './dto/adminLogin.dto';
import { AdminResponseInterface } from './types/AdminResponse.interface';
import { AdminBanResponseInterface } from './types/adminBanResponse.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async registerAdmin(registerDto: AdminRegisterDto): Promise<AdminEntity> {
    const errorResponse = {
      errors: {},
    };

    const adminByEmail = await this.adminRepository.findOne({
      select: {
        email: true,
      },
      where: {
        email: registerDto.email,
      },
    });

    const adminByUsername = await this.adminRepository.findOne({
      select: {
        username: true,
      },
      where: {
        username: registerDto.username,
      },
    });

    const adminByMobile = await this.adminRepository.findOne({
      select: {
        mobile: true,
      },
      where: {
        mobile: registerDto.mobile,
      },
    });

    if (adminByEmail) {
      errorResponse.errors['email'] = 'ایمیل وارد شده از قبل موجود می باشد';
    }

    if (adminByMobile) {
      errorResponse.errors['mobile'] =
        'شماره تماس وارد شده از قبل موجود می باشد';
    }

    if (adminByUsername) {
      errorResponse.errors['username'] =
        'نام کاربری وارد شده از قبل موجود می باشد';
    }

    if (adminByEmail || adminByUsername || adminByMobile) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newAdmin = new AdminEntity();
    newAdmin.isBan = '0';
    if (newAdmin.isBan === '1') {
      errorResponse.errors['username'] = 'شماره تماس وارد شده مسدود می باشد';
      throw new HttpException(errorResponse, HttpStatus.FORBIDDEN);
    }

    Object.assign(newAdmin, registerDto);

    const admin = await this.adminRepository.save(newAdmin);

    delete admin.password;

    return admin;
  }

  async loginAdmin(loginDto: AdminLoginDto): Promise<AdminEntity> {
    const errorResponse = {
      errors: {},
    };

    const query = `select a.id,
    a.first_name,
    a.last_name,
    a.username,
    a.mobile,
    a.email,
    a.password,
    b.title as blog_title,
    bc.title as blog_category_title
    from admin a
    left join blog b on a.id = b.author_id
    left join blog_category bc on a.id = bc.register_id where email = '${loginDto.email}' limit 1`;

    const admins = await this.adminRepository.query(query);
    const admin = admins[0];

    if (!admin) {
      errorResponse.errors['admin'] =
        'ایمیل و یا رمز عبور وارد شده صحیح نمی باشد';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (admin.isBan === '1') {
      errorResponse.errors['admin'] = 'شماره تماس وارد شده مسدود می باشد';
      throw new HttpException(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    const isPasswordCorrect = await compare(loginDto.password, admin.password);

    if (!isPasswordCorrect) {
      errorResponse.errors['admin'] =
        'ایمیل و یا رمز عبور وارد شده صحیح نمی باشد';
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    delete admin.password;
    return admin;
  }

  async banAdmin(currentAdmin: AdminEntity, id: number) {
    const admin = await this.findAdminByID(id);

    if (!admin) {
      throw new HttpException('ادمین مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (!currentAdmin) {
      throw new HttpException(
        'شما مجاز به بن کردن ادمین نمی باشید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (currentAdmin.id === admin.id) {
      throw new HttpException(
        'شما مجاز به بن کردن خودتان نمی باشید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (admin.isBan === '1') {
      throw new HttpException(
        'ادمین مورد نظر مسدود می باشد',
        HttpStatus.NOT_FOUND,
      );
    }

    admin.isBan = '1';

    await this.adminRepository.save(admin);

    return admin;
  }

  async adminList(admin: AdminEntity, query: any) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به فعالیت در این بخش نیستید',
        HttpStatus.NOT_FOUND,
      );
    }

    let findAll: string;

    findAll = `select a.id,
    a.first_name,
    a.last_name,
    a.username,
    a.mobile,
    a.email,
    b.title as blog_title,
    bc.title as blog_category_title
    from admin a
    left join blog b on a.id = b.author_id
    left join blog_category bc on a.id = bc.register_id
    order by a.id desc`;

    if (query.search) {
      findAll = `select a.id,
      a.first_name,
      a.last_name,
      a.username,
      a.mobile,
      a.email,
      b.title as blog_title,
      bc.title as blog_category_title
      from admin a
      left join blog b on a.id = b.author_id
      left join blog_category bc on a.id = bc.register_id
      where a.username = '${query.search}'
      order by a.id desc`;
    }

    if (query.limit) {
      findAll = `select a.id,
      a.first_name,
      a.last_name,
      a.username,
      a.mobile,
      a.email,
      b.title as blog_title,
      bc.title as blog_category_title
      from admin a
      left join blog b on a.id = b.author_id
      left join blog_category bc on a.id = bc.register_id
      order by a.id desc
      limit ${query.limit}`;
    }

    if (query.offset) {
      findAll = `select a.id,
      a.first_name,
      a.last_name,
      a.username,
      a.mobile,
      a.email,
      b.title as blog_title,
      bc.title as blog_category_title
      from admin a
      left join blog b on a.id = b.author_id
      left join blog_category bc on a.id = bc.register_id
      order by a.id desc
      offset ${query.offset}`;
    }

    const admins = await this.adminRepository.query(findAll);
    const adminsCount = await this.adminRepository.count();

    return { admins, adminsCount };
  }

  async removeAdmin(admin: AdminEntity, id: number) {
    if (!admin) {
      throw new HttpException(
        'شما مجاز به حذف کردن ادمین نمی باشید',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const adminResult = await this.findAdminByID(id);

    if (adminResult.id === admin.id) {
      throw new HttpException(
        'شما مجاز به حذف خودتان نمی باشید',
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = `delete from admin where id =${id}`;

    const removeAdmin = await this.adminRepository.query(query);

    if (removeAdmin[1] === 0)
      throw new HttpException(
        'حذف ادمین با موفقیت انجام نشد',
        HttpStatus.NOT_FOUND,
      );

    return {
      message: 'ادمین مورد نظر با موفقیت حذف شد',
    };
  }

  async findAdminByID(id: number): Promise<AdminEntity> {
    const query = `select a.id,
    a.first_name,
    a.last_name,
    a.username,
    a.mobile,
    a.email,
    b.title as blog_title,
    bc.title as blog_category_title
    from admin a
    left join blog b on a.id = b.author_id
    left join blog_category bc on a.id = bc.register_id
    where a.id= ${id}`;
    const admins = await this.adminRepository.query(query);

    const admin = admins[0];

    if (!admin) {
      throw new HttpException('ادمین مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    return admin;
  }

  async findAdminByEmail(email: string): Promise<AdminEntity> {
    const query = `select a.id,
    a.first_name,
    a.last_name,
    a.username,
    a.mobile,
    a.email,
    b.title as blog_title,
    bc.title as blog_category_title
    from admin a
    left join blog b on a.id = b.author_id
    left join blog_category bc on a.id = bc.register_id
    where a.email = '${email}'
    limit 1`;
    const admins = await this.adminRepository.query(query);
    const admin = admins[0];

    if (!admin) {
      throw new HttpException('ادمین مورد نظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    return admin;
  }

  generateAdminJwtToken(admin: AdminEntity): string {
    const options = {
      expiresIn: '30d',
    };
    return sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      ACCESS_TOKEN_SECRET_KEY,
      options,
    );
  }

  async buildAdminResponse(
    admin: AdminEntity,
  ): Promise<AdminResponseInterface> {
    return {
      admin: {
        ...admin,
        adminToken: this.generateAdminJwtToken(admin),
      },
    };
  }

  async buildBanAdminResponse(
    admin: AdminEntity,
  ): Promise<AdminBanResponseInterface> {
    return {
      admin: {
        ...admin,
      },
    };
  }

  async buildAdminResponses(admin: AdminEntity) {
    delete admin.password;
    return {
      admin: {
        ...admin,
      },
    };
  }
}
