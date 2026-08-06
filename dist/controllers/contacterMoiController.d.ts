import { Request, Response } from 'express';
import type { PersonnelRequest } from '../middleware/personnelMiddleware.js';
export declare const creerContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listerContacts: (_req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getContactById: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const modifierContact: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const supprimerContact: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleAppele: (req: PersonnelRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=contacterMoiController.d.ts.map