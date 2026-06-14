import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateRoleDto, UpdateDevicesDto } from '../common/dto/update-user.dto';
import type { AuthUser } from '../common/types/auth-user.interface';

@ApiTags('users')
@ApiBearerAuth('firebase-token')
@Controller('users')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Thông tin người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Profile của user đang đăng nhập' })
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getMe(user);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Danh sách tất cả users' })
  @ApiResponse({ status: 200, description: 'Danh sách users trong hệ thống' })
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Patch(':email/role')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Cập nhật quyền user' })
  @ApiParam({ name: 'email', description: 'Email của user cần cập nhật' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Cập nhật role thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy user' })
  async updateRole(
    @Param('email') email: string,
    @Body() body: UpdateRoleDto,
    @CurrentUser() currentUser: AuthUser,
  ) {
    const decodedEmail = decodeURIComponent(email);
    // Không cho phép admin tự hạ quyền chính mình
    if (decodedEmail === currentUser.email && body.role !== 'admin') {
      throw new BadRequestException('Admin không thể tự hạ quyền của chính mình');
    }
    const updated = await this.usersService.updateRole(decodedEmail, body.role);
    if (!updated) throw new NotFoundException(`Không tìm thấy user ${email}`);
    return updated;
  }

  @Patch(':email/devices')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Cấp quyền truy cập thiết bị cho user' })
  @ApiParam({ name: 'email', description: 'Email của user' })
  @ApiBody({ type: UpdateDevicesDto })
  @ApiResponse({ status: 200, description: 'Cập nhật danh sách thiết bị thành công' })
  async updateDevices(
    @Param('email') email: string,
    @Body() body: UpdateDevicesDto,
  ) {
    const updated = await this.usersService.updateDevices(decodeURIComponent(email), body.deviceIds);
    if (!updated) throw new NotFoundException(`Không tìm thấy user ${email}`);
    return updated;
  }

  @Delete(':email')
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Xóa tài khoản user' })
  @ApiParam({ name: 'email', description: 'Email của user cần xóa' })
  @ApiResponse({ status: 200, description: 'Xóa tài khoản thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa tài khoản đang đăng nhập' })
  async deleteUser(
    @Param('email') email: string,
    @CurrentUser() currentUser: AuthUser,
  ) {
    const decodedEmail = decodeURIComponent(email);
    if (decodedEmail === currentUser.email) {
      throw new BadRequestException('Không thể xóa tài khoản đang đăng nhập');
    }
    const deleted = await this.usersService.deleteUser(decodedEmail);
    if (!deleted) throw new NotFoundException(`Không tìm thấy user ${email}`);
    return { success: true, message: `Đã xóa tài khoản ${decodedEmail}` };
  }
}
