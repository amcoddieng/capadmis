import { Response } from 'express';
import { PersonnelRequest } from '../middleware/personnelMiddleware.js';
export declare const getAdminDashboard: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConseillerDashboard: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=dashboardController.d.ts.map