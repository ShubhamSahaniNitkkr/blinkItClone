import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  deliverPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliverPartner",
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  items: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      count: { type: Number, required: true },
    },
  ],
  deliverLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  deliverPersonLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
  },
  pickupLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  status: {
    type: String,
    enum: ["available", "confirmed", "arriving", "delivered", "cancelled"],
    default: "available",
  },
  totalPrice: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;

const getNextSequenceValue = async (sequenceName) => {
  // finding the value with name
  // then incrementing
  // new value and upsert means update it
  const sequenceDoc = await Counter.findOneAndUpdate(
    {
      name: sequenceName,
    },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDoc.sequence_value;
};

orderSchema.pre("save", async (next) => {
  if (this.isNew) {
    const sequenceValue = await getNextSequenceValue("orderId");
    this.orderId = `BLINKIT_ORDER${sequenceValue.toString().padStart(5, "0")}`;
  }
  next();
});
