const moment = require("moment");

/**
 * Middle ware for API generation cooldown.
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 * @param {function} next - Express next function
 */
function forAPIKeys(req, res, next) {
  let COOLDOWN = 5; // Seconds
  const difference = moment().subtract(moment(global.apiKeyCreation)).unix();

  if (difference < COOLDOWN) {
    // Restrict the access
    res.status(429).send(`Too many requests. Retry after ${COOLDOWN}s`);
  } else {
    // Update the last request time and continue
    global.apiKeyCreation = moment().toISOString();
    next();
  }
}

/**
 * Middle ware for Card generation cooldown.
 * @param {object} req - Express request instance
 * @param {object} res - Express response instance
 * @param {function} next - Express next function
 */
function forCards(req, res, next) {
  let COOLDOWN = 5; // Seconds
  const difference = moment().subtract(moment(global.apiKeyCreation)).unix();

  if (difference < COOLDOWN) {
    // Restrict the access
    res.status(429).send(`Too many requests. Retry after ${COOLDOWN}s`);
  } else {
    // Update the last request time and continue
    global.apiKeyCreation = moment().toISOString();
    next();
  }
}

module.exports = {
  forAPIKeys,
  forCards,
};
