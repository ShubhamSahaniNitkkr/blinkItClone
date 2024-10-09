import "dotenv/config.js";
import jsonwebtoken from "jsonwebtoken";
import { Customer, DeliveryPartner } from "../../models/index.js";

// Function to generate tokens
export const generateToken = async (user) => {
  const accessToken = jsonwebtoken.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jsonwebtoken.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  return { accessToken, refreshToken };
};

// Customer Login / Register Handler
export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
      return reply.status(400).send({ message: "Phone number is required" });
    }

    let customer = await Customer.findOne({ phone });

    // Create new customer if not found
    if (!customer) {
      customer = new Customer({ phone, role: "Customer", isActivated: true });
      await customer.save();
    }

    const { accessToken, refreshToken } = await generateToken(customer);
    return reply.send({
      accessToken,
      refreshToken,
      customer,
      message: customer
        ? "Welcome Back!"
        : "Account Successfully Created and Logged In!",
    });
  } catch (error) {
    console.error("Error during customer login:", error);
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

// Delivery Partner Login Handler
export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return reply
        .status(400)
        .send({ message: "Email and Password are required" });
    }

    const deliveryPartner = await DeliveryPartner.findOne({ email });

    if (!deliveryPartner) {
      return reply.status(400).send({ message: "Delivery Partner not found" });
    }

    // Compare plain text password
    const isMatch = password === deliveryPartner.password;

    if (!isMatch) {
      return reply.status(401).send({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = await generateToken(deliveryPartner);
    return reply.send({
      accessToken,
      refreshToken,
      deliveryPartner,
      message: "Welcome Back Delivery Partner!",
    });
  } catch (error) {
    console.error("Error during delivery partner login:", error);
    return reply.status(500).send({ message: "An error occurred", error });
  }
};

// Refresh Token Handler
export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh Token required" });
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
      return reply.status(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "Invalid Refresh Token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateToken(
      user
    );
    return reply.send({
      message: "Token refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    return reply
      .status(401)
      .send({ message: "Invalid or Expired Refresh Token" });
  }
};

// Fetch User Handler
export const fetchUser = async (req, reply) => {
  try {
    const { userId, role } = req.user;

    let user;

    if (role === "Customer") {
      user = await Customer.findById(userId);
    } else if (role === "DeliveryPartner") {
      user = await DeliveryPartner.findById(userId);
    } else {
      return reply.status(403).send({ message: "Invalid Role" });
    }

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    return reply.send({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return reply.status(500).send({ message: "An error occurred", error });
  }
};
