import { Request, Response } from 'express';
export declare const createPersonnel: (req: Request & {
    personnel?: {
        role: string;
    };
}, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePersonnelById: (req: Request & {
    personnel?: {
        role: string;
    };
}, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePersonnelById: (req: Request & {
    personnel?: {
        role: string;
    };
}, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const bloquerPersonnel: (req: Request & {
    personnel?: {
        role: string;
    };
}, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const loginPersonnel: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateSelfPersonnel: (req: Request & {
    personnel?: {
        id: number;
        role: string;
    };
}, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listerPersonnelPourSuperAdmin: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listerConseillersPourAdmin: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=personnelController.d.ts.map