const express = require("express");
const router = express.Router();
const moment = require("moment");
const { check, validationResult } = require("express-validator");

// Models
const { Product, APIKey } = require("../configs/Schemas");

// Middleware - Extract API-key
router.use(async (req, res, next) => {
  const apiKey = req.get("apiKey");

  if (apiKey === "" || apiKey === " " || typeof apiKey === "undefined") {
    res.status(401).send("Invalid Request. No API key found in the Header.");
  } else {
    const api = await APIKey.findOne({ key: apiKey });
    if (api !== null) {
      const EXPIRY_DURATION = 60 * (process.env.API_EXPIRY || 60); // Default 1hr Expiry
      const difference = moment().subtract(moment(api.created)).unix(); // In Seconds

      if (difference < EXPIRY_DURATION && api.disabled === false) {
        req.apiKey = apiKey;
        next();
      } else res.status(401).send("Expired API Key.");
    } else res.status(401).send("No such API key found.");
  }
});

// Routes
router.get("/", getAllProducts);
router.get("/:id", getAProduct);
router.post(
  "/",
  [
    check("name").exists().isString(),
    check("price").exists().isNumeric(),
    check("description").exists().isString(),
    check("sale").exists().isBoolean().optional(),
    check("discount").exists().isNumeric().optional(),
    check("image").exists().isString().optional(),
  ],
  addAProduct
);
router.put(
  "/:id",
  [
    check("name").isString().optional(),
    check("price").isNumeric().optional(),
    check("description").isString().optional(),
    check("sale").isBoolean().optional(),
    check("discount").isNumeric().optional(),
    check("image").isString().optional(),
  ],
  editAProduct
);
router.delete("/:id", deleteAProduct);

// Callback functions

/**
 * Route to get all the products
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 */
async function getAllProducts(req, res) {
  const { apiKey } = req;

  try {
    const products = await Product.find({ apiKey });

    const sProducts = [];

    products.forEach((product, index) => {
      let sProduct = product.toJSON();
      sProduct["id"] = sProduct._id;

      delete sProduct._id;
      delete sProduct.__v;
      delete sProduct.apiKey;

      sProducts.push(sProduct);
    });
    res.json(sProducts);
  } catch (error) {
    res.status(500).send("Internal Server error!");
  }
}

/**
 * Route to get a single Product
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 */
async function getAProduct(req, res) {
  const { apiKey } = req;

  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id, apiKey });

    if (product !== null) {
      // Remove _id , __v, apiKey
      let sProduct = product.toJSON();
      sProduct["id"] = sProduct._id;
      delete sProduct._id;
      delete sProduct.__v;
      delete sProduct.apiKey;

      res.json(sProduct);
    } else {
      res.status(404).send("Product doesn't exist.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error!");
  }
}

/**
 * Route to add a new Product
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 */
async function addAProduct(req, res) {
  if (validationResult(req).isEmpty()) {
    const { apiKey } = req;
    const { name, price, description, sale, discount, image } = req.body;

    // Create a new Document
    let newProduct = new Product({
      name,
      price,
      description,
      sale,
      discount,
      image,
      apiKey,
    });

    // Save the new Document in the database
    try {
      let updated = await newProduct.save();

      // Remove _id, __v, apiKey
      let sProduct = updated.toJSON();
      sProduct["id"] = sProduct._id;
      delete sProduct._id;
      delete sProduct.__v;
      delete sProduct.apiKey;

      res.status(201).json(sProduct);
    } catch (error) {
      res.status(500).send("Internal Server error!");
    }
  } else {
    res
      .status(400)
      .send(
        "Missing Values. Required Fields : [name, price, description], Format : [name:String, price:Number, description:String, sale:Boolean, discount:Number, image:String]"
      );
  }
}

/**
 * Route to edit a Product
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 */
async function editAProduct(req, res) {
  if (validationResult(req).isEmpty()) {
    const { apiKey } = req;

    const { id } = req.params;

    const fields = [
      "name",
      "price",
      "description",
      "sale",
      "discount",
      "image",
    ];

    var sFields = {};

    //   Sanitize fields
    Object.keys(req.body).forEach((field) => {
      if (fields.includes(field)) sFields[field] = req.body[field];
    });

    try {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: id, apiKey },
        sFields, //Update only the sanitizes fields
        { new: true }
      );

      if (updatedProduct !== null) {
        // Remove _id and __v
        let sProduct = updatedProduct.toJSON();
        sProduct["id"] = sProduct._id;
        delete sProduct._id;
        delete sProduct.__v;
        delete sProduct.apiKey;

        res.json(sProduct);
      } else {
        res.status(404).send("No Product found to update!");
      }
    } catch (error) {
      res.status(500).send("Internal Server error!");
    }
  } else {
    res
      .status(400)
      .send(
        "Invalid Format. Required format : [name:String, price:Number, description:String, sale:Boolean, discount:Number, image:String]"
      );
  }
}

/**
 * Route to delete a Product
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 */
async function deleteAProduct(req, res) {
  const { apiKey } = req;

  const { id } = req.params;
  try {
    const deleted = await Product.findOneAndDelete({ _id: id, apiKey });
    if (deleted !== null) {
      res.json({ success: true });
    } else {
      res.status(404).send("No Product found to delete!");
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
}

module.exports = { router };
