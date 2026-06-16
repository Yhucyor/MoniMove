import { FirebaseService } from '../firebase/firebase.service';
import { AuthUser } from '../common/types/auth-user.interface';
export declare class UsersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getMe(user: AuthUser): Promise<import("../common/types/auth-user.interface").UserProfile>;
    getAllUsers(): Promise<import("../common/types/auth-user.interface").UserProfile[]>;
    updateRole(email: string, role: 'user' | 'admin'): Promise<import("../common/types/auth-user.interface").UserProfile>;
    updateDevices(email: string, deviceIds: string[]): Promise<import("../common/types/auth-user.interface").UserProfile>;
    deleteUser(email: string): Promise<boolean>;
}
