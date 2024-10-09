export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
  } catch (error) {
    return reply.status(500).send({ message: "Failed to create order", error });
  }
};
