import { Request, Response } from 'express';
import { EtudiantRequest } from '../middleware/etudiantMiddleware.js';
import { PersonnelRequest } from '../middleware/personnelMiddleware.js';
export declare const updateSelf: (req: EtudiantRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createEtudiantByAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateEtudiantByAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteEtudiant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const bloquerEtudiant: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const monProfil: (req: EtudiantRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listerEtudiants: (_req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=etudiantController.d.ts.map