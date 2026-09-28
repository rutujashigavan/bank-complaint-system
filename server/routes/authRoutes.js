const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

/* FORGOT PASSWORD */
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;

