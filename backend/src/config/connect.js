import mongoose from "mongoose";

export const connectMongoDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("MONGO DB Connected");
  } catch (error) {
    console.log("MONGO DB CONNECTION ISSUE ", error);
  }
};
