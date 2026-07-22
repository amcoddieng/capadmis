import "dotenv/config";
import http from "http";
import app from "./app.js";
import { initSocketServer } from "./lib/socketServer.js";

const PORT = Number(process.env.PORT || 3000);

const httpServer = http.createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});