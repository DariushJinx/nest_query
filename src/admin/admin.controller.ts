import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Admin } from 'src/decorators/admin.decorators';
import { AdminService } from './admin.service';
import { AdminRegisterDto } from './dto/adminRegister.dto';
import { AdminType } from './types/admin.types';
import { AdminLoginDto } from './dto/adminLogin.dto';
import { AdminResponseInterface } from './types/AdminResponse.interface';
import { AdminEntity } from './admin.entity';
import { BackendValidationPipe } from 'src/pipes/backendValidation.pipe';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';

@Controller('')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/register/admin')
  @UsePipes(new BackendValidationPipe())
  async registerAdmin(
    @Body() registerDto: AdminRegisterDto,
  ): Promise<AdminType> {
    const admin = await this.adminService.registerAdmin(registerDto);
    return admin;
  }

  @Post('auth/login/admin')
  @UsePipes(new BackendValidationPipe())
  async loginAdmin(
    @Body() loginDto: AdminLoginDto,
  ): Promise<AdminResponseInterface> {
    const admin = await this.adminService.loginAdmin(loginDto);
    return await this.adminService.buildAdminResponse(admin);
  }

  @Put('admin/ban/:id')
  @UseGuards(AdminAuthGuard)
  async banAdmin(@Admin() currentAdmin: AdminEntity, @Param('id') id: number) {
    const admin = await this.adminService.banAdmin(currentAdmin, id);
    return await this.adminService.buildBanAdminResponse(admin);
  }

  @Delete('admin/:id')
  @UseGuards(AdminAuthGuard)
  async removeUser(@Admin() admin: AdminEntity, @Param('id') id: number) {
    await this.adminService.removeAdmin(admin, id);
    return {
      message: 'ادمین مورد نظر با موفقیت حذف شد',
    };
  }

  @Get('admins/list')
  @UseGuards(AdminAuthGuard)
  async listOfUsers(@Admin() admin: AdminEntity, @Query() query: any) {
    const admins = await this.adminService.adminList(admin, query);
    return admins;
  }
}
