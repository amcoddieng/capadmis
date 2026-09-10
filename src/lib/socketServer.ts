import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET doit être défini en production');
}

const FINAL_JWT_SECRET = JWT_SECRET || 'votre_cle_secrete_par_defaut';

let ioInstance: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('Token manquant'));

    try {
      const decoded = jwt.verify(token, FINAL_JWT_SECRET) as Record<string, unknown>;
      const email = decoded['email'] as string | undefined;
      if (!email) return next(new Error('Token invalide : email manquant'));
      socket.data['email'] = email;
      next();
    } catch {
      next(new Error('Token invalide ou expiré'));
    }
  });

  io.on('connection', (socket) => {
    const email = socket.data['email'] as string;
    socket.join(email);
    console.log(`[WS] connecté : ${email}`);

    socket.on('disconnect', () => {
      console.log(`[WS] déconnecté : ${email}`);
    });
  });

  return io;
}

export function emitToUser(email: string, event: string, data: unknown): void {
  if (!ioInstance) return;
  ioInstance.to(email).emit(event, data);
}
