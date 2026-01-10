import jwt from "jsonwebtoken";
import User from "../Model/userSchema.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    // req.headers.authorization
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    // If there is no token
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Get user from the token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};



