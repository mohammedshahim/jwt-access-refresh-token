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

  if (!userDoc) {
    throw new HttpError(401, "Invalid username or password");
  }

  await verifyPassword(userDoc.password, req.body.password);

  const refreshTokenDoc = await models.RefreshToken.findOne({
    owner: userDoc._id,
  });

  const refreshToken = createRefreshToken(userDoc._id, refreshTokenDoc._id);
  const accessToken = createAccessToken(userDoc._id);

  return {
    id: userDoc._id,
    accessToken,
    refreshToken,
  };
});

const newRefreshToken = errorHandler(async (req, res) => {
  const currentRefreshToken = validateRefreshToken(req.body.refreshToken);

  const refreshTokenDoc = await models.RefreshToken({
    owner: currentRefreshToken.userId,
  });

  await models.RefreshToken.deleteOne({
    _id: currentRefreshToken.tokenId,
  });

  await models.RefreshToken.create({
    owner: currentRefreshToken.userId,
  });

  const refreshToken = createRefreshToken(
    currentRefreshToken.userId,
    refreshTokenDoc._id
  );
  const accessToken = createAccessToken(currentRefreshToken.userId);

  return {
    id: currentRefreshToken.userId,
    accessToken,
    refreshToken,
  };
});

const newAccessToken = errorHandler(async (req, res) => {
  const currentRefreshToken = await validateRefreshToken(req.body.refreshToken);
  const accessToken = createAccessToken(currentRefreshToken.userId);

  return {
    id: currentRefreshToken.userId,
    accessToken,
    refreshToken: req.body.refreshToken,
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

const validateRefreshToken = async (refreshToken) => {
  const decodeToken = () => {
    try {
      return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new HttpError(401, "Unauthorized");
    }
  };

  const decodedToken = decodeToken();
  const tokenExists = await models.RefreshToken.exists({
    _id: decodedToken.tokenId,
  });
  if (tokenExists) {
    return decodedToken;
  } else {
    throw new HttpError(401, "Unauthorized");
  }
};

module.exports = {
  signup,
  login,
  newRefreshToken,
  newAccessToken,
};
