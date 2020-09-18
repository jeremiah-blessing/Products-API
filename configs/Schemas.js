const mongoose = require("mongoose");

// Schemas
const APIKeysSchema = new mongoose.Schema({
  key: String,
  created: Date,
  disabled: Boolean,
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  description: String,
  sale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  image: {
    type: String,
    default: "",
  },
  apiKey: { type: String, required: true },
  category: {
    type: Array,
    default: ["uncategorised"],
  },
  stock: {
    type: Number,
    default: 1,
  },
});

// Models

const APIKey = mongoose.model("APIKey", APIKeysSchema);
const Product = mongoose.model("Product", ProductSchema);

module.exports = {
  APIKey,
  Product,
};
