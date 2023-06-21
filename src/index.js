const express = require("express");
const logger = require("./logger");
const app = express();
const port = process.env.PORT || 3000;

const startServer = () => {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
};

module.exports = startServer;
