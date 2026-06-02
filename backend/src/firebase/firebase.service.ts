import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;
  private rtdb: admin.database.Database;

  onModuleInit() {
    if (admin.apps.length === 0) {
      this.logger.log('Initializing Firebase Admin fallback...');
      admin.initializeApp({
        databaseURL: 'https://monitoring-d6063-default-rtdb.firebaseio.com'
      });
    }
    this.db = admin.firestore();
    this.rtdb = admin.database();
    this.logger.log('Firebase Database services initialized successfully.');
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  getDatabase(): admin.database.Database {
    return this.rtdb;
  }

  async verifyIdToken(token: string) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      this.logger.error('Xác thực Firebase Token thất bại:', error);
      throw error;
    }
  }
}
