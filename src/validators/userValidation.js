const Joi = require("joi");

function validateUser(user) {
   const schema = Joi.object({
      name: Joi.string().min(5).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(15).required(),
      role: Joi.string().valid("instructor", "student").required(),
   });
   return schema.validate(user);
}

module.exports = { validateUser };
