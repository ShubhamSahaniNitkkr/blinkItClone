import "dotenv/config.js";
import jsonwebtoken from "jsonwebtoken";

export const verifyToken = async (req, reply) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      reply.status(401).send({ message: "Access token required" });

      const accessToken = authHeader.split("Bearer ")[1];
      const decoded = jsonwebtoken.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      req.user = decoded;
      return true;
    }
  } catch (error) {
    reply.status(403).send({ message: "Invalid or expired token" });
  }
};
