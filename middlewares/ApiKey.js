const moment = require("moment");
const { APIKey } = require("../configs/Schemas");

async function isValidAPIKey(req, res, next) {
  const { apikey } = req.params;
  const api = await APIKey.findOne({ key: apikey });

  if (api !== null) {
    const EXPIRY_DURATION = 60 * (process.env.API_EXPIRY || 60); // Default 1hr Expiry
    const difference = moment().subtract(moment(api.created)).unix(); // In Seconds

    if (difference < EXPIRY_DURATION && api.disabled === false) {
      req.apiKey = apikey;
      next();
    } else res.status(400).send("Expired API Key.");
  } else res.status(400).send("No API key found.");
}

module.exports = { isValidAPIKey };
