import { Response } from 'express';
import { HybridRequest } from '../middleware/hybridMiddleware.js';
export declare const mesNotifications: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const compterNonLues: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const marquerLue: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const marquerToutesLues: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=notificationController.d.ts.map