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


    const resetUrl = `https://saas-role-front-b3o9y2fsp-rahin-mon-ss-projects.vercel.app/reset-password/${resetToken}`;

const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- HEADER -->
            <tr>
              <td style="background:#0f172a; padding:20px 24px;">
                <h1 style="margin:0; font-size:18px; color:#ffffff;">
                  RBAC Control Panel
                </h1>
                <p style="margin:4px 0 0; font-size:12px; color:#cbd5f5;">
                  Secure Authorization System
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:32px 24px; color:#111827;">
                <p style="margin:0 0 16px; font-size:14px;">
                  Hello <strong>${user.name}</strong>,
                </p>

                <p style="margin:0 0 20px; font-size:14px; line-height:1.6;">
                  We received a request to reset your account password.
                  Click the button below to continue.
                </p>

                <!-- BUTTON -->
                <div style="text-align:center; margin:32px 0;">
                  <a href="${resetUrl}"
                     style="background:#2563eb; color:#ffffff; text-decoration:none;
                            padding:14px 28px; border-radius:6px; font-size:14px;
                            font-weight:600; display:inline-block;">
                    Reset Password
                  </a>
                </div>

                <p style="margin:0 0 16px; font-size:13px; color:#374151;">
                  This link will expire in <strong>15 minutes</strong>.
                </p>

                <p style="margin:0; font-size:13px; color:#6b7280;">
                  If you did not request this reset, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f9fafb; padding:16px 24px; font-size:11px; color:#6b7280;">
                <p style="margin:0;">
                  This is an automated security message. Please do not reply.
                </p>
                <p style="margin:6px 0 0;">
                  © ${new Date().getFullYear()} RBAC Control Panel
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

await sendEmail(
  user.email,
  "Reset Your Password",
  htmlContent
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


