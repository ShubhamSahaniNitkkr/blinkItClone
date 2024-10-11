import {
  Branch,
  Customer,
  DeliveryPartner,
  Order,
} from "../../models/index.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    console.log(items, branch, totalPrice, userId);

    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);

    if (!customerData) {
      return reply.status(404).send({ message: "Customer not found !" });
    }

    const newOrder = new Order({
      customer: userId,
      branch,
      items: items.map((item) => ({
        id: item.id,
        item: item.id,
        count: item.count,
      })),
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.liveLocation.address || "Address not available.",
      },
      pickupLocation: {
        latitude: branchData.location.latitude,
        longitude: branchData.location.longitude,
        address: branchData.location.address || "Address not available.",
      },
    });

    const saveOrder = await newOrder.save();
    return reply.status(201).send(saveOrder);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ message: "Failed to create order", error });
  }
};

export const confirmOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;
    const { deliveryPartnerLocation } = req.body;

    const deliveryPartnerData = await DeliveryPartner.findById(userId);

    if (!deliveryPartnerData) {
      return reply
        .status(404)
        .send({ message: "Delivery Partner not found !" });
    }

    const orderData = await Order.findById(orderId);

    if (!orderData) {
      return reply.status(404).send({ message: "Order not found !" });
    }

    if (orderData.status !== "available") {
      return reply.status(404).send({ message: "Order not available !" });
    }

    orderData.status = "confirmed";
    orderData.deliveryPartner = userId;
    orderData.deliveryPersonLocation = {
      latitude: deliveryPartnerLocation?.latitude,
      longitude: deliveryPartnerLocation?.longitude,
      address: deliveryPartnerLocation?.address || "Address not available",
    };

    req.server.io.to(orderId).emit("orderConfirmed", orderData);

    await orderData.save();
    return reply.send(orderData);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to confirm order", error });
  }
};

export const updateOrderStatus = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;
    const { status, deliveryPartnerLocation } = req.body;

    const deliveryPartnerData = await DeliveryPartner.findById(userId);

    if (!deliveryPartnerData) {
      return reply
        .status(404)
        .send({ message: "Delivery Partner not found !" });
    }

    const orderData = await Order.findById(orderId);

    if (!orderData) {
      return reply.status(404).send({ message: "Order not found !" });
    }

    if (["cancelled", "delivered"].includes(orderData.status)) {
      return reply.status(404).send({ message: "Order cannot be updated !" });
    }

    if (orderData.deliveryPartner.toString() !== userId) {
      return reply.status(404).send({ message: "Unauthorized !" });
    }

    orderData.status = status;
    orderData.deliveryPersonLocation = {
      ...deliveryPartnerLocation,
    };

    req.server.io.to(orderId).emit("liveTrackUpdates", orderData);

    await orderData.save();
    return reply.send(orderData);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to update order status", error });
  }
};

export const getOrders = async (req, reply) => {
  try {
    const { status, customerId, deliveryPartnerId, branchId } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (customerId) {
      query.customer = customerId;
    }
    if (deliveryPartnerId) {
      query.deliveryPartner = deliveryPartnerId;
      query.branch = branchId;
    }

    const ordersData = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );

    return reply.send(ordersData);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to retrieve order", error });
  }
};

export const getOrdersById = async () => {
  try {
    const { orderId } = req.query;

    const orderData = await Order.findById(orderId);

    if (!orderData) {
      return reply.status(404).send({ message: "Order not found" });
    }

    return reply.send(orderData);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to retrieve order", error });
  }
};
