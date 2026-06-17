import { Response } from 'express';
import type { HybridRequest } from '../middleware/hybridMiddleware.js';
type MulterRequest = HybridRequest & {
    file?: Express.Multer.File;
};
export declare const ajouterPieceJointe: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listerPiecesJointes: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPieceJointe: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const modifierPieceJointe: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changerStatusPieceJointe: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const supprimerPieceJointe: (req: HybridRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=pieceJointeController.d.ts.map