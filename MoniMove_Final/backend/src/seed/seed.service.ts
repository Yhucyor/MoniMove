import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from '../firebase/firebase.service';

const TEST_ACCOUNTS = [
  {
    email: 'admin@test.monimove.com',
    password: 'Admin@123456',
    name: 'Admin Test',
    role: 'admin' as const,
    deviceIds: [] as string[],
  },
  {
    email: 'user@test.monimove.com',
    password: 'User@123456',
    name: 'User Test',
    role: 'user' as const,
    deviceIds: ['DEVICE_ESP32_01'],
  },
];

/**
 * SeedService — từ MoniMove_v2
 * Tự động tạo tài khoản test Firebase Auth + Firestore profile khi khởi động
 * Disable bằng env: SEED_TEST_ACCOUNTS=false
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async onModuleInit() {
    if (process.env.SEED_TEST_ACCOUNTS === 'false') return;

    for (const account of TEST_ACCOUNTS) {
      await this.ensureTestAccount(account);
    }
  }

  private async ensureTestAccount(account: (typeof TEST_ACCOUNTS)[0]) {
    try {
      let userRecord: admin.auth.UserRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(account.email);
        this.logger.log(`Test account exists: ${account.email}`);
      } catch {
        userRecord = await admin.auth().createUser({
          email: account.email,
          password: account.password,
          displayName: account.name,
          emailVerified: true,
        });
        this.logger.log(`Created test account: ${account.email}`);
      }

      const db = this.firebaseService.getFirestore();
      const userRef = db.collection('users').doc(account.email);
      const doc = await userRef.get();

      if (!doc.exists) {
        await userRef.set({
          email: account.email,
          name: account.name,
          avatar: '',
          role: account.role,
          deviceIds: account.deviceIds,
          createdAt: new Date().toISOString(),
        });
        this.logger.log(`Seeded Firestore profile: ${account.email} (${account.role})`);
      } else {
        const data = doc.data();
        if (!data?.role || (account.role === 'admin' && data.role !== 'admin')) {
          await userRef.update({
            role: account.role,
            deviceIds: account.deviceIds,
          });
        }
      }
    } catch (error) {
      this.logger.warn(`Could not seed ${account.email}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
