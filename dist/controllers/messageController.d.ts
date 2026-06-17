import { Response } from 'express';
import type { HybridRequest } from '../middleware/hybridMiddleware.js';
export declare const envoyerMessage: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const mesConversations: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConversation: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const compterNonLus: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const marquerVu: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=messageController.d.ts.map