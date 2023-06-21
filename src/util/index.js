const errorHandler = (fn) => {
  return async function (req, res, next) {
    try {
      const result = await fn(req, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { errorHandler };
