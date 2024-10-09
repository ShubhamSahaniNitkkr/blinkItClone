import { Customer, DeliveryPartner } from "../../models/index.js";

export const updateUser = async (req, reply) => {
  try {
    const { userId } = req.user;
    const updatedData = req.body;
    let user =
      (await Customer.findById(userId)) ||
      (await DeliveryPartner.findById(userId));

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    let userModal;
    if (user.role === "Customer") {
      userModal = Customer;
    } else if (user.role === "DeliveryPartner") {
      userModal = DeliveryPartner;
    } else {
      return reply.status(404).send({ message: "Invalid Role" });
    }

    const updateUser = await userModal.findByIdAndUpdate(
      userId,
      {
        $set: updatedData,
      },
      { new: true, runValidators: true }
    );

    if (!updateUser) {
      return reply.status(404).send({ message: "User not found" });
    }

    return reply.send({
      message: "User updated successfully",
      user: updatedData,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Failed to update user", error });
  }
};
