import { UsersService } from './users.service';
import { UpdateRoleDto, UpdateDevicesDto } from '../common/dto/update-user.dto';
import type { AuthUser } from '../common/types/auth-user.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: AuthUser): Promise<import("../common/types/auth-user.interface").UserProfile>;
    getAllUsers(): Promise<import("../common/types/auth-user.interface").UserProfile[]>;
    updateRole(email: string, body: UpdateRoleDto, currentUser: AuthUser): Promise<import("../common/types/auth-user.interface").UserProfile>;
    updateDevices(email: string, body: UpdateDevicesDto): Promise<import("../common/types/auth-user.interface").UserProfile>;
    deleteUser(email: string, currentUser: AuthUser): Promise<{
        success: boolean;
        message: string;
    }>;
}
