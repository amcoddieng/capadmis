import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_par_defaut';
let ioInstance = null;
export function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
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
        socket.join(email);
        console.log(`[WS] connecté : ${email}`);
        socket.on('disconnect', () => {
            console.log(`[WS] déconnecté : ${email}`);
        });
    });
    return io;
}
export function emitToUser(email, event, data) {
    if (!ioInstance)
        return;
    ioInstance.to(email).emit(event, data);
}
//# sourceMappingURL=socketServer.js.map