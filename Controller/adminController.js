import User from "../Model/userSchema.js";
import Request from "../Model/requestSchema.js";


//get all user admin only

export const getAllUsers = async (req, res) => {
    try {
        //getting all users
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

//update role only admin

export const updateUserRole = async (req, res) => {
    try {
        //getting the role from frontend
        const { role } = req.body;
        //getting user id form url
        const userId = req.params.id;
        //checking if role is valid
        if (!["admin", "manager", "user"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        //checking if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
         //checking if user is trying to update their own role
        if (req.user._id.toString() === userId) {
            return res.status(403).json({ message: "Cannot update your own role" });
        }
        //updating role
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

    const totalOpen = await Request.countDocuments({ status: "open" });
    const totalInProgress = await Request.countDocuments({ status: "in_progress" });
    const totalResolved = await Request.countDocuments({ status: "resolved" });
    const totalClosed = await Request.countDocuments({ status: "closed" });
    const totalRejected = await Request.countDocuments({ status: "rejected" });

    res.json({
      totalUsers,
      totalRequests,
      totalOpen,
      totalInProgress,
      totalResolved,
      totalClosed,
      totalRejected,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};


//delete user only admin

export const deleteUser = async (req, res) => {
    try {
        //getting user id from url
        const userId = req.params.id;
        //checking if user is trying to delete their own account
        if (req.user._id.toString() === userId) {
            return res.status(403).json({ message: "Cannot delete your own account" });
        }
        //deleting user
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user" });
    }
};

//getting manager workoad
export const getManagerWorkload = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" })
      .select("name email");

    const workload = await Promise.all(
      managers.map(async (m) => {

        const activeCount = await Request.countDocuments({
          assignedTo: m._id,
          status: { $in: ["open", "in_progress"] },
        });

        return {
          _id: m._id,
          name: m.name,
          email: m.email,
          pendingCount: activeCount, // keep name for UI compatibility
        };
      })
    );

    res.json(workload);
  } catch (error) {
    res.status(500).json({ message: "Failed to load workload" });
  }
};
