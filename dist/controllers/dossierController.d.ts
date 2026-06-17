import { Request, Response } from 'express';
import { EtudiantRequest } from '../middleware/etudiantMiddleware.js';
import { PersonnelRequest } from '../middleware/personnelMiddleware.js';
export declare function generateUniqueDossierCode(): Promise<string>;
export declare const creerDossier: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const monDossier: (req: EtudiantRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const mesDossiersConseiller: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listerDossiers: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDossierById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changerStatus: (req: Request & {
    personnel?: {
        id: number;
        role: string;
    };
}, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const assignerConseiller: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=dossierController.d.ts.map