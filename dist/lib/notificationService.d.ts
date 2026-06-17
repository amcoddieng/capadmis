import { TypeNotification } from '@prisma/client';
export interface NotifExtras {
    prenomDestinataire?: string;
    nomDestinataire?: string;
    codeDossier?: string;
    nouveauStatut?: string;
    prenomConseiller?: string;
    nomConseiller?: string;
}
export declare function envoyerNotification(type: TypeNotification, destination: string, extras?: NotifExtras): Promise<void>;
//# sourceMappingURL=notificationService.d.ts.map