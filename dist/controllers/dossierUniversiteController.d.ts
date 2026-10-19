import { Response } from 'express';
import { PersonnelRequest } from '../middleware/personnelMiddleware.js';
import { MixedRequest } from '../middleware/mixedAuthMiddleware.js';
type MulterRequest = PersonnelRequest & {
    file?: Express.Multer.File;
};
export declare const createDossierUniversite: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllDossiersUniversite: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDossierUniversiteById: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDossierUniversite: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDossierUniversite: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDossiersUniversiteByDossier: (req: MixedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAvisEtudiant: (req: MixedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadLettreMotivation: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const uploadCv: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLettreMotivationUrl: (req: MixedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCvUrl: (req: MixedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=dossierUniversiteController.d.ts.map