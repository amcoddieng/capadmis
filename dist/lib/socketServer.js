import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';
let ioInstance = null;
const connectedUsers = new Map(); // email → socketId
export function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    ioInstance = io;
    io.use((socket, next) => {
        const token = socket.handshake.auth['token'];
        if (!token)
            return next(new Error('Token manquant'));
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const email = decoded['email'];
            if (!email)
                return next(new Error('Token invalide : email manquant'));
            socket.data['email'] = email;
            next();
        }
        catch {
            next(new Error('Token invalide ou expiré'));
        }
    });
    io.on('connection', (socket) => {
        const email = socket.data['email'];
        connectedUsers.set(email, socket.id);
        console.log(`[WS] connecté : ${email}`);
        socket.on('disconnect', () => {
            connectedUsers.delete(email);
            console.log(`[WS] déconnecté : ${email}`);
        });
    });
    return io;
}
export function emitToUser(email, event, data) {
    if (!ioInstance)
        return;
    const socketId = connectedUsers.get(email);
    if (socketId) {
        ioInstance.to(socketId).emit(event, data);
    }
}
//# sourceMappingURL=socketServer.js.map