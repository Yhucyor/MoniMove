import { OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
export declare class SeedService implements OnModuleInit {
    private readonly firebaseService;
    private readonly logger;
    constructor(firebaseService: FirebaseService);
    onModuleInit(): Promise<void>;
    private ensureTestAccount;
}
