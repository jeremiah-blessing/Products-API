const express = require("express");
const app = express();
const cors = require("cors");
const randomstring = require("randomstring");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const moment = require("moment");
require("dotenv").config();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to DB.");
  });

// Swagger YAML Import
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

// Import Models
const { APIKey, Product } = require("./configs/Schemas");

// Configurations
global.apiKeyCreation = moment().toISOString();
global.productCreation = moment().toISOString();
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
const { forAPIKeys } = require("./middlewares/Cooldown");
const { isValidAPIKey } = require("./middlewares/ApiKey");
app.use(express.static("public"));
app.use(express.static("dist"));

const sampleProducts = require("./sampleProducts.json");

app.use(
  "/api-docs/:apikey",
  [
    isValidAPIKey,
    async function (req, res, next) {
      const { apikey } = req.params;
      const isFound = await APIKey.findOne({ key: apikey });

      if (isFound !== null) {
        swaggerDocument.info.description = `API to manage Products of your store. [Preview your site <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>](/site/${apikey})<br/><p><b>You API Key: ${apikey}</b><br><br><em>Use the above key to Authorize.</em></p><br><em>Confused?</em> [Generate some sample products](/create-sample-products/${apikey}) `;
        req.swaggerDoc = swaggerDocument;
        next();
      } else {
        res.status(404).send("No API keys found. Regenerate keys if expired.");
      }
    },
  ],
  swaggerUi.serve,
  swaggerUi.setup()
);

// Routes
const productsRoute = require("./routes/products").router;

app.use("/products", productsRoute);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/docs", (req, res) => {
  res.render("redoc");
});

app.get("/generate-key", forAPIKeys, async (req, res) => {
  const newApiKey = new APIKey({
    key: randomstring.generate(),
    created: moment(),
    disabled: false,
  });

  //   Create a new API key
  try {
    const response = await newApiKey.save();
    res.status(201).json({ key: response.key });
  } catch (error) {
    res.status(500).send("Internal Error!");
  }
});

app.get("/create-sample-products/:apikey", isValidAPIKey, async (req, res) => {
  const { apikey } = req.params;

  let promises = [];
  sampleProducts.forEach((product) => {
    let newProduct = new Product({ ...product, apiKey: apikey });
    promises.push(newProduct.save());
  });

  try {
    await Promise.all(promises);
    res.redirect(`/site/${apikey}`);
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

app.get("/site/:apikey", isValidAPIKey, async (req, res) => {
  // Get all the products from the DB
  const products = await Product.find({ apiKey: req.params.apikey });

  const sProducts = [];

  products.forEach((product, index) => {
    let sProduct = product.toJSON();
    sProduct["id"] = sProduct._id;

    delete sProduct._id;
    delete sProduct.__v;
    delete sProduct.apiKey;

    sProducts.push(sProduct);
  });
  res.render("products", {
    products: sProducts,
    env: process.env.NODE_ENV,
    apikey: req.params.apikey,
  });
});

app.get("*", (req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log("Server started in PORT : " + PORT);
});
