import { Request, Response, NextFunction } from 'express';
export interface PersonnelRequest extends Request {
    personnel?: {
        id: number;
        email: string;
        role: string;
        code: string;
    };
}
export declare const verifyPersonnelToken: (req: PersonnelRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireSuperAdmin: (req: PersonnelRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireSuperAdminOrAdmin: (req: PersonnelRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=personnelMiddleware.d.ts.map