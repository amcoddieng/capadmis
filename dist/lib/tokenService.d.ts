import { Response } from 'express';
export declare function generateAccessToken(payload: object): string;
export declare function createRefreshToken(userId: number, userType: 'etudiant' | 'personnel'): Promise<string>;
export declare function setRefreshTokenCookie(res: Response, token: string): void;
export declare function clearRefreshTokenCookie(res: Response): void;
export declare function verifyRefreshToken(token: string): Promise<{
    userId: number;
    userType: 'etudiant' | 'personnel';
} | null>;
export declare function revokeRefreshToken(token: string): Promise<void>;
export declare function revokeAllUserRefreshTokens(userId: number, userType: 'etudiant' | 'personnel'): Promise<void>;
//# sourceMappingURL=tokenService.d.ts.map