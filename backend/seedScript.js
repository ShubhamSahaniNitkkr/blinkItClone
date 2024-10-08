import "dotenv/config";
import mongoose from "mongoose";
import { categories, products } from "./seedData.js";
import { Category, Product } from "./src/models/index.js";

const fillDummyData = async () => {
  console.log(process.env.MONGO_URI, "process.env.MONGO_URI");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // await Product.deleteMany({}); // to delete all entries from Mongo DB

    const categoryDocs = await Category.insertMany(categories);
    const categoryNameIdMap = categoryDocs.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});
    const productWithCatId = products.map((product) => ({
      ...product,
      category: categoryNameIdMap[product.category],
    }));
    await Product.insertMany(productWithCatId);

    console.log("Database Added");
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.connection.close();
  }
};

fillDummyData();
