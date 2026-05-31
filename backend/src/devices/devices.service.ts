import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class DevicesService implements OnModuleInit {
  private readonly logger = new Logger(DevicesService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async onModuleInit() {
    await this.seedMockData();
  }

  async getDevice(deviceId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('devices').doc(deviceId).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    if (!data) {
      return null;
    }
    return {
      id: data.id,
      name: data.name,
      status: data.status,
      battery: data.battery,
      lastUpdate: data.lastUpdate || Date.now(),
    };
  }

  async getLatestPosition(deviceId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db
      .collection('gps_logs')
      .where('deviceId', '==', deviceId)
      .get();

    if (snapshot.empty) {
      // Return default center if no gps logs
      return {
        lat: 10.8045,
        lng: 106.7380,
        timestamp: Date.now(),
        speed: 0,
        heading: 0,
      };
    }

    const docs = snapshot.docs.map(d => d.data());
    docs.sort((a, b) => b.timestamp - a.timestamp);
    const data = docs[0];

    if (!data) {
      return {
        lat: 10.8045,
        lng: 106.7380,
        timestamp: Date.now(),
        speed: 0,
        heading: 0,
      };
    }
    return {
      lat: data.lat,
      lng: data.lng,
      timestamp: data.timestamp,
      speed: data.speed || 0,
      heading: data.heading || 0,
    };
  }

  async getRoute(deviceId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('devices').doc(deviceId).get();
    
    if (doc.exists) {
      const data = doc.data();
      if (data && data.route) {
        let waypoints = data.route.waypoints || [];
        if (Array.isArray(waypoints)) {
          waypoints = waypoints.map((wp: any) => {
            if (Array.isArray(wp)) {
              return wp as [number, number];
            } else if (wp && typeof wp.lat === 'number' && typeof wp.lng === 'number') {
              return [wp.lat, wp.lng] as [number, number];
            }
            return [0, 0] as [number, number];
          });
        }
        return {
          deviceId,
          waypoints,
          distance: data.route.distance || 12500,
          duration: data.route.duration || 1080,
        };
      }
    }

    // Default route fallback (Nguyen Huu Canh - Vo Nguyen Giap optimized)
    return {
      deviceId,
      waypoints: [
        [10.7756, 106.7068],
        [10.8018, 106.7280],
        [10.8045, 106.7380],
      ],
      distance: 6500,
      duration: 600,
    };
  }

  async getHistory(deviceId: string, start: number, end: number) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db
      .collection('gps_logs')
      .where('deviceId', '==', deviceId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const startNum = Number(start);
    const endNum = Number(end);

    const logs = snapshot.docs
      .map(doc => doc.data())
      .filter(data => data && data.timestamp >= startNum && data.timestamp <= endNum);

    logs.sort((a, b) => a.timestamp - b.timestamp);

    return logs.map(data => ({
      lat: data?.lat || 0,
      lng: data?.lng || 0,
      timestamp: data?.timestamp || 0,
      speed: data?.speed || 0,
    }));
  }

  private async seedMockData() {
    try {
      const db = this.firebaseService.getFirestore();
      const deviceRef = db.collection('devices').doc('device-001');
      const deviceSnap = await deviceRef.get();

      let shouldSeed = !deviceSnap.exists;
      if (deviceSnap.exists) {
        const data = deviceSnap.data();
        if (data && data.route && data.route.waypoints) {
          const waypoints = data.route.waypoints;
          const hasOld = Array.isArray(waypoints) && waypoints.some((wp: any) => {
            const lat = Array.isArray(wp) ? wp[0] : (wp ? wp.lat : 0);
            return lat === 10.8100 || lat === 10.8015 || lat === 10.7895 || lat === 10.7865;
          });
          if (hasOld || waypoints.length !== 3) {
            this.logger.log('Old or unoptimized route coordinates detected. Updating database...');
            shouldSeed = true;
          }
        }
      }

      if (shouldSeed) {
        this.logger.log('Seeding default device "device-001" and route into Firestore...');
        await deviceRef.set({
          id: 'device-001',
          name: 'MoniMove - 01',
          status: 'active',
          battery: 85,
          lastUpdate: Date.now(),
          route: {
            waypoints: [
              { lat: 10.7756, lng: 106.7068 },
              { lat: 10.8018, lng: 106.7280 },
              { lat: 10.8045, lng: 106.7380 },
            ],
            distance: 6500,
            duration: 600,
          },
        });

        // Seed some historical gps logs
        const gpsLogsRef = db.collection('gps_logs');
        const now = Date.now();
        
        // Delete old logs if we are re-seeding
        const oldGpsSnap = await gpsLogsRef.where('deviceId', '==', 'device-001').get();
        if (!oldGpsSnap.empty) {
          const batch = db.batch();
          oldGpsSnap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          this.logger.log('Deleted old GPS logs.');
        }

        const mockPositions = [
          { lat: 10.7756, lng: 106.7068, speed: 30, heading: 45, timestamp: now - 20000 },
          { lat: 10.8018, lng: 106.7280, speed: 42, heading: 90, timestamp: now - 10000 },
          { lat: 10.8045, lng: 106.7380, speed: 48, heading: 120, timestamp: now },
        ];

        for (const pos of mockPositions) {
          await gpsLogsRef.add({
            deviceId: 'device-001',
            ...pos,
          });
        }
        this.logger.log('Seeded 3 mock GPS log entries successfully.');
      }
    } catch (error) {
      this.logger.error('Error seeding mock database data:', error);
    }
  }
}
