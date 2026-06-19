import { FirebaseService } from '../firebase/firebase.service';
import type { Response } from 'express';
declare class VerifyTokenDto {
    idToken: string;
}
export declare class AuthController {
    private readonly firebaseService;
    private readonly logger;
    constructor(firebaseService: FirebaseService);
    verifyToken(body: VerifyTokenDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
export {};
