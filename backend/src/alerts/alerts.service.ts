import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async createAlert(alertData: {
    deviceId: string;
    alertType: string;
    message: string;
    timestamp?: number;
  }) {
    try {
      const db = this.firebaseService.getFirestore();
      const payload = {
        deviceId: alertData.deviceId,
        alertType: alertData.alertType,
        message: alertData.message,
        timestamp: alertData.timestamp || Date.now(),
      };
      
      const docRef = await db.collection('alerts').add(payload);
      this.logger.log(`Alert created successfully in Firestore: ${docRef.id}`);
      return { success: true, alertId: docRef.id };
    } catch (error) {
      this.logger.error('Error saving alert in Firestore:', error);
      throw error;
    }
  }
}
