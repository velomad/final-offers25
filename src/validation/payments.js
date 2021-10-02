const Joi = require("joi");

module.exports = {
  addToUserWalletSchema: Joi.object({
    amount: Joi.number().min(1).required(),
  }),
};
