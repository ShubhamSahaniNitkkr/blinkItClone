import "dotenv/config";
import Fastify from "fastify";
import { connectMongoDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { buildAdminRouter, admin } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";

const start = async () => {
  await connectMongoDB(process.env.MONGO_URI);
  const app = Fastify();
  await registerRoutes(app);
  await buildAdminRouter(app);

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
    if (err) {
      console.log(err);
    } else {
      console.log(
        `Blink it Running on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });
};

start();
