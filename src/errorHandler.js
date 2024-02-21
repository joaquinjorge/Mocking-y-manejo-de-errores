const errors = require("./customError.js");

const errorHandler = (error,description) => {
  let message = "Ocurrió un error inesperado.";
  let status = 500;

  switch (error.message) {
    case errors.INVALID_PROPS:
      message =  description;
      status = 422;
      break;
    case errors.INCOMPLETE:
      message =  description;
      status = 400;
      break;
    case errors.INVALID_ID:
      message = description;
      status = 422;
      break;
    case errors.PRODUCT_NOT_FOUND:
      message =  description;
      status = 404;
      break;
    case errors.PRODUCT_ALREADY_EXISTS:
      message =  description;
      status = 409;
      break;
    case errors.CART_NOT_FOUND:
      message =  description;
      status = 404;
      break;
    case errors.CART_ITEM_NOT_FOUND:
      message =  description;
      status = 404;
      break;
    // ... otros casos de errores comunes ...
  }

  return { message, status };
};

module.exports = errorHandler;
