const mongoose = require("mongoose");

// Schemas
const APIKeysSchema = new mongoose.Schema({
  key: String,
  created: Date,
  disabled: Boolean,
});

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  sale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  image: {
    type: String,
    default: "",
  },
  apiKey: { type: String, required: true },
});

// Models

const APIKey = mongoose.model("APIKey", APIKeysSchema);
const Product = mongoose.model("Product", ProductSchema);

module.exports = {
  APIKey,
  Product,
};
