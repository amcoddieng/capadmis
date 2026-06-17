import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
export declare function initSocketServer(httpServer: HttpServer): Server;
export declare function emitToUser(email: string, event: string, data: unknown): void;
//# sourceMappingURL=socketServer.d.ts.map