const express = require("express");
const logger = require("./logger");
const routes = require("./routes");
const app = express();
const port = process.env.PORT || 3000;

const startServer = () => {
  app.use(express.json());

  app.use("/api", routes);

  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
};

module.exports = startServer;
