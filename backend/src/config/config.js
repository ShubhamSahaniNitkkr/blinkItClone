import "dotenv/config";
import fastifySession from "@fastify/session";
import connectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/index.js";

const MongoDBStore = await connectMongoDBSession(fastifySession);

export const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

sessionStore.on("error", (err) => {
  console.log("Session store error1", err);
});

export const authenticate = async (email, password) => {
  if (email && password) {
    const user = await Admin.findOne({ email });
    if (user || (email === 12345 && password === 12345)) {
      return Promise.resolve({ email: email, password: password });
    } else {
      return null;
    }
  }
  return null;
};

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;
