const express = require("express");
const router = express.Router();

const tap = (req, res) => {};

router.post("/signup", tap);
router.post("/login", tap);
router.post("/logout", tap);
router.post("/accessToken", tap);
router.post("/refreshToken", tap);

module.exports = router;
