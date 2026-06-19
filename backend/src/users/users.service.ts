import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { AuthUser } from "../common/types/auth-user.interface";

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getMe(user: AuthUser) {
    const profile = await this.firebaseService.getUserProfile(user.email);
    return (
      profile || {
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        deviceIds: user.deviceIds,
        createdAt: "",
      }
    );
  }

  getAllUsers() {
    return this.firebaseService.getAllUsers();
  }

  updateRole(email: string, role: "user" | "admin") {
    return this.firebaseService.updateUserRole(email, role);
  }

  updateDevices(email: string, deviceIds: string[]) {
    return this.firebaseService.updateUserDevices(email, deviceIds);
  }

  deleteUser(email: string) {
    return this.firebaseService.deleteUser(email);
  }
}
