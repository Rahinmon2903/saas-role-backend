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

//update role only admin

export const updateUserRole = async (req, res) => {
  try {
    const {  role } = req.body;
    const userId = req.params.id;
    if(!["admin", "manager", "user"].includes(role)){
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if(req.user._id === userId){
      return res.status(403).json({ message: "Cannot update your own role" });
    }
    user.role = role;
    await user.save();
      res.json({
      message: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user role" });
  }
};

//getting all Stats only admin

export const getAllStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalPendingRequests = await Request.countDocuments({ status: "pending" });
    const totalApprovedRequests = await Request.countDocuments({ status: "approved" });
    const totalRejectedRequests = await Request.countDocuments({ status: "rejected" });
    res.json({
      totalUsers,
      totalRequests,
      totalPendingRequests,
      totalApprovedRequests,
      totalRejectedRequests,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

//delete user only admin
