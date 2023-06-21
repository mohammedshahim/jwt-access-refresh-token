const express = require("express");
const controllers = require("../controllers");
const router = express.Router();

const tap = (req, res) => {};

router.post("/signup", controllers.auth.signup);
router.post("/login", controllers.auth.login);
router.post("/logout", tap);
router.post("/accessToken", tap);
router.post("/refreshToken", controllers.auth.newRefreshToken);

module.exports = router;
