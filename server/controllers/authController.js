const User = require("../models/user");
const bcrypt = require("bcryptjs");
const BankUser = require("../models/bankUser");
const sendEmail = require("../utils/sendEmail");

// 🔹 REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, customerId, password } = req.body;

    const registerEmail = email.trim().toLowerCase();
    const registerCustomerId = customerId.trim();

    // ✅ CHECK IF TRUE BANK USER USING ONLY EMAIL + CUSTOMER ID
    const validBankUser = await BankUser.findOne({
      email: registerEmail,
      customerId: registerCustomerId
    });

    if (!validBankUser) {
      return res.status(401).json({
        message: "Unauthorized user"
      });
    }

    // ✅ CHECK IF USER ALREADY REGISTERED
    const existingUser = await User.findOne({
      $or: [
        { email: registerEmail },
        { customerId: registerCustomerId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already registered. Please login."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: registerEmail,
      customerId: registerCustomerId,
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      message: "Registration successful",
      user
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// 🔹 LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, customerId, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    const loginEmail = email.trim().toLowerCase();
    const loginCustomerId = customerId.trim();
    const loginPassword = password.trim();

    // ================= ADMIN LOGIN =================
    if (
      loginEmail === "admin@securebank.com" &&
      loginCustomerId === "ADMIN001" &&
      loginPassword === "admin123"
    ) {
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        role: "admin",
        user: {
          name: "Bank Admin",
          email: "admin@securebank.com",
          emailId: "admin@securebank.com",
          customerId: "ADMIN001",
          customerID: "ADMIN001",
          adminId: "ADMIN001"
        }
      });
    }

    // ================= USER LOGIN =================
    const user = await User.findOne({
      email: loginEmail,
      customerId: loginCustomerId
    });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }



    res.json({
      success: true,
      message: "Login successful",
      role: user.role || "user",
      user
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

/* ================= FORGOT PASSWORD ================= */

let otpStore = {};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Email not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
        
    await sendEmail(
      email,
      "Secure Bank Password Reset OTP",
      `Your OTP for password reset is: ${otp}`
    );

    res.status(200).json({
      message: "OTP sent to your email"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

/* ================= RESET PASSWORD ================= */

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const storedOtp = otpStore[email];

    if (!storedOtp) {
      return res.status(400).json({
        message: "OTP not found. Please request again."
      });
    }

    if (storedOtp.expiresAt < Date.now()) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    delete otpStore[email];

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};