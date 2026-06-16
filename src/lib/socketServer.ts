import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';

let ioInstance: Server | null = null;

const connectedUsers = new Map<string, string>(); // email → socketId

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('Token manquant'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
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
    connectedUsers.set(email, socket.id);
    console.log(`[WS] connecté : ${email}`);

    socket.on('disconnect', () => {
      connectedUsers.delete(email);
      console.log(`[WS] déconnecté : ${email}`);
    });
  });

  return io;
}

export function emitToUser(email: string, data: unknown): void {
  if (!ioInstance) return;
  const socketId = connectedUsers.get(email);
  if (socketId) {
    ioInstance.to(socketId).emit('notification', data);
  }
}
