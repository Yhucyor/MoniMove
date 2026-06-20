import { OnModuleInit } from "@nestjs/common";
import * as admin from "firebase-admin";
import { AuthUser, UserProfile } from "../common/types/auth-user.interface";
export declare class FirebaseService implements OnModuleInit {
    private readonly logger;
    private db;
    onModuleInit(): void;
    getFirestore(): admin.firestore.Firestore;
    verifyIdToken(token: string): Promise<import("firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
    getUserRole(email: string, name: string, avatar: string): Promise<string>;
    getUserProfile(email: string): Promise<UserProfile | null>;
    getAllUsers(): Promise<UserProfile[]>;
    updateUserRole(email: string, role: "user" | "admin"): Promise<UserProfile | null>;
    updateUserDevices(email: string, deviceIds: string[]): Promise<UserProfile | null>;
    deleteUser(email: string): Promise<boolean>;
    canAccessDevice(user: AuthUser, deviceId: string): boolean;
}
