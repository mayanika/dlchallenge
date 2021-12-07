module.exports = function AppError(status, message, data) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    this.status = status;
    this.data = data;
};

require('util').inherits(module.exports, Error);