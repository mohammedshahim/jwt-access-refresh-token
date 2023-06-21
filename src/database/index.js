const mongoose = require("mongoose");
const logger = require("../logger");
mongoose.Promise = global.Promise;

const connectToDatabase = async () => {
  try {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;

    const connectionString = `mongodb://${host}:${port}/${dbName}`;

    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("Connected to database");
  } catch (error) {
    logger.info(error);
  }
};

module.exports = connectToDatabase;
