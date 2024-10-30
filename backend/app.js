import "dotenv/config";
import Fastify from "fastify";
import { connectMongoDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { buildAdminRouter, admin } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";

const start = async () => {
  await connectMongoDB(process.env.MONGO_URI);
  const app = Fastify();

  app.register(fastifySocketIO, {
    cors: { origin: "*" },
    pingInterval: 10000,
    pingTimeout: 10000,
    transports: ["websocket"],
  });

  await registerRoutes(app);
  await buildAdminRouter(app);

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
    // app.listen({ port: PORT }, (err, addr) => {
    if (err) {
      console.log(err);
    } else {
      console.log(
        `Blink it Running on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });

  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("Live track initiated !");

      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`User Joined Room ${orderId} !`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected !");
      });
    });
  });
};

start();
