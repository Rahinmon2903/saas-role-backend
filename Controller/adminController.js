import User from "../Model/userSchema.js";
import Request from "../Model/requestSchema.js";


//get all user admin only

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
