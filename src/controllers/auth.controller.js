const jwt = require("jsonwebtoken");
const models = require("../models");
const argon2 = require("argon2");
const { errorHandler, withTransaction } = require("../util");
const { HttpError } = require("../error");

const signup = errorHandler(async (req, res) => {
  const userDoc = await models.User.create({
    username: req.body.username,
    password: await argon2.hash(req.body.password),
  });

  const refreshTokenDoc = await models.RefreshToken.create({
    owner: userDoc._id,
  });

  userDoc.save({});
  refreshTokenDoc.save({});

  const refreshToken = createRefreshToken(userDoc._id, refreshTokenDoc._id);
  const accessToken = createAccessToken(userDoc._id);

  return {
    id: userDoc._id,
    accessToken,
    refreshToken,
  };
});

const login = errorHandler(async (req, res) => {
  const userDoc = await models.User.findOne({
    username: req.body.username,
  })
    .select("+password")
    .exec();

  console.log(userDoc);

  if (!userDoc) {
    throw new HttpError(401, "Invalid username or password");
  }

  await verifyPassword(userDoc.password, req.body.password);

  const refreshTokenDoc = await models.RefreshToken.findOne({
    owner: userDoc._id,
  });

  await refreshTokenDoc.save({});

  const refreshToken = createRefreshToken(userDoc._id, refreshTokenDoc._id);
  const accessToken = createAccessToken(userDoc._id);

  return {
    id: userDoc._id,
    accessToken,
    refreshToken,
  };
});

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

const verifyPassword = async (hashedPassword, rawPassword) => {
  if (await argon2.verify(hashedPassword, rawPassword)) {
  } else {
    throw new HttpError(401, "Invalid username or password");
  }
};

module.exports = {
  signup,
  login,
};
