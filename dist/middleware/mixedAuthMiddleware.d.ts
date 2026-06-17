import { Request, Response, NextFunction } from 'express';
export interface MixedRequest extends Request {
    etudiant?: {
        id: number;
        email: string;
    };
    personnel?: {
        id: number;
        email: string;
        role: string;
        code: string;
    };
}
export declare const verifyEtudiantOrPersonnelToken: (req: MixedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=mixedAuthMiddleware.d.ts.map