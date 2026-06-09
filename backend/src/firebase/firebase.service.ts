import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { async } from 'rxjs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      this.logger.log('Initializing Firebase Admin fallback...');
      admin.initializeApp();
    }
    this.db = admin.firestore();
    this.logger.log('Firestore Database initialized successfully.');
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }
}
  async verifyIdToken(token: string) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    this.logger.error('Xác thực Firebase Token thất bại:', error);
    throw error;
  }
}

