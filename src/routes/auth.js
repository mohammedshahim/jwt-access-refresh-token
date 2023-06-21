const express = require("express");
const controllers = require("../controllers");
const router = express.Router();

const tap = (req, res) => {};

router.post("/signup", controllers.auth.signup);
router.post("/login", tap);
router.post("/logout", tap);
router.post("/accessToken", tap);
router.post("/refreshToken", tap);

module.exports = router;
