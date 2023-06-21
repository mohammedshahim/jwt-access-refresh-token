const jwt = require("jsonwebtoken");
const models = require("../models");
const argon2 = require("argon2");
const { errorHandler, withTransaction } = require("../util");

const signup = errorHandler(
  withTransaction(async (req, res, session) => {
    const userDoc = await models.User.create({
      username: req.body.username,
      password: await argon2.hash(req.body.password),
    });

    const refreshTokenDoc = await models.RefreshToken.create({
      owner: userDoc._id,
    });

    userDoc.save({ session });
    refreshTokenDoc.save({ session });

    const refreshToken = createRefreshToken(userDoc._id, refreshTokenDoc._id);
    const accessToken = createAccessToken(userDoc._id);

    return {
      id: userDoc._id,
      accessToken,
      refreshToken,
    };
  })
);

const createAccessToken = (userId) => {
  return jwt.sign(
    {
      userId: userId,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

const createRefreshToken = (userId, refreshTokenId) => {
  return jwt.sign(
    {
      userId: userId,
      tokenId: refreshTokenId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

module.exports = {
  signup,
};
