import { Request, Response, NextFunction } from 'express';
export interface HybridRequest extends Request {
    personnel?: {
        id: number;
        email: string;
        role: string;
        code: string;
    };
    etudiant?: {
        id: number;
        email: string;
    };
}
export declare const verifyAnyToken: (req: HybridRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=hybridMiddleware.d.ts.map