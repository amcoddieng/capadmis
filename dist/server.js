import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initSocketServer } from "./lib/socketServer.js";
const PORT = 3000;
const httpServer = http.createServer(app);
initSocketServer(httpServer);
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map