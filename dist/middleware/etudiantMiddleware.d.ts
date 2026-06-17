import { Request, Response, NextFunction } from 'express';
export interface EtudiantRequest extends Request {
    etudiant?: {
        id: number;
        email: string;
    };
}
export declare const verifyEtudiantToken: (req: EtudiantRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=etudiantMiddleware.d.ts.map