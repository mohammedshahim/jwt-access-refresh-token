const express = require("express");
const logger = require("./logger");
const routes = require("./routes");
const connectToDatabase = require("./database");
const app = express();
const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectToDatabase();

  app.use(express.json());

  app.use("/api", routes);

  app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
  });

  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
};

module.exports = startServer;
