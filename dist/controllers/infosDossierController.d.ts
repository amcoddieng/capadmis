import { Response } from 'express';
import { HybridRequest } from '../middleware/hybridMiddleware.js';
export declare const creerInfosDossier: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const modifierInfosDossier: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getInfosDossier: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=infosDossierController.d.ts.map