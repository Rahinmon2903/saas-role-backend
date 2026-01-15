import User from "../Model/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../Utils/sendEmail.js";
import crypto from "crypto";

// REGISTER (NO TOKEN)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,

    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN (TOKEN HERE)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return same response
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving to DB
    user.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();


    const resetUrl = `https://ecommerce-front-end-rtyf.vercel.app/reset-password/${resetToken}`;

    const message = `
Hello ${user.name},

You requested a password reset.

Click the link below to reset your password:
${resetUrl}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.
`;

    await sendEmail(
      user.email,
      "Reset Your Password",
      message
    );

    return res.status(200).json({
      message: "If the email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Error sending reset email",
    });
  }
};





//reset
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }
    //taking the token from url and hashing it because while storing we hashed it
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    //checking if the token is valid and it is matching  and token is not expired
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() }
    });
    //checking if the user exists
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link"
      });
    }
    //setting the new password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpire = null;
    //saving
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: "Error resetting password" });
  }
};


