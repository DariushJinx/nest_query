import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { UserType } from './types/user.types';
import { LoginDto } from './dto/login.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { AdminEntity } from '../admin/admin.entity';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';
import { Admin } from 'src/decorators/admin.decorators';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/register')
  @UsePipes(new BackendValidationPipe())
  async registerUser(@Body() registerDto: RegisterDto): Promise<UserType> {
    const user = await this.userService.registerUser(registerDto);
    return user;
  }

  @Post('auth/login')
  @UsePipes(new BackendValidationPipe())
  async loginUser(@Body() loginDto: LoginDto): Promise<UserResponseInterface> {
    const user = await this.userService.loginUser(loginDto);
    return await this.userService.buildUserResponse(user);
  }

  @Put('user/ban/:id')
  @UseGuards(AdminAuthGuard)
  async banUser(@Admin() admin: AdminEntity, @Param('id') id: number) {
    const user = await this.userService.banUser(admin, id);
    return await this.userService.buildBanAdminResponse(user);
  }

  @Get('users/list')
  @UseGuards(AdminAuthGuard)
  async listOfUsers(@Admin() admin: AdminEntity, @Query() query: any) {
    const users = await this.userService.userList(admin, query);
    return users;
  }
}
