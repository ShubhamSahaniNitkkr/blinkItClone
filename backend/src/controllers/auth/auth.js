import "dotenv/config.js";
import jsonwebtoken from "jsonwebtoken";
import { Customer, DeliveryPartner } from "../../models/index.js";

export const generateToken = async (user) => {
  const accessToken = jsonwebtoken.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const refreshToken = jsonwebtoken.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = new Customer({ phone, role: "Customer", isActivated: true });
      customer.save();
    }

    const { accessToken, refreshToken } = await generateToken(customer);
    return reply.send({
      accessToken,
      refreshToken,
      customer,
      message: customer
        ? "Welcome Back !"
        : "Account Successfully Created and Logged In !",
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "An error occurred", error });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;

    let deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      reply.status(400).send({ message: "Delivery Partner not found" });
    }

    const isMatch = password === deliveryPartner.password;

    if (!isMatch) {
      reply.status(404).send({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = generateToken(deliveryPartner);
    return reply.send({
      accessToken,
      refreshToken,
      deliveryPartner,
      message: "Welcome Back Delivery Partner!",
    });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ message: "An error occurred", error });
  }
};

export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return reply.send(401).send({ message: "Refresh Token required" });
  }

  try {
    const decoded = jsonwebtoken.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    let user;
    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decoded.role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(decoded.userId);
    } else {
      return reply.send(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.send(403).send({ message: "Invalid Refresh Token" });
    }

    const { accessToken, refreshToken } = generateToken(user);
    return reply.send({
      message: "Token refreshed",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return reply.send(401).send({ message: "Refresh Token required" });
  }
};

export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;
    let user;

    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.send(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
