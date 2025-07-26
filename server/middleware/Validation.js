const joi = require("joi");

// ✅ Signup Validation
const ValidateSignup = (req, res, next) => {
  try {
    const validateRequest = joi.object({
      username: joi.string().min(3).max(20).required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const { error } = validateRequest.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Login Validation
const ValidateLogin = (req, res, next) => {
  try {
    const validateRequestLogin = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const { error } = validateRequestLogin.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { ValidateLogin, ValidateSignup };
