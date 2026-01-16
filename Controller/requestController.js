import Notification from "../Model/notificationSchema.js";
import Request from "../Model/requestSchema.js";
import User from "../Model/userSchema.js";


//create request

export const createRequest = async (req, res) => {
  try {
    // const { title, description } = req.body;
    const { title, description } = req.body;
    //creating new request
    const request = new Request({
      title,
      description,
      createdBy: req.user._id,
      history: [
        {
          action: "created",
          by: req.user._id,
        },
      ],


    });
    //save
    await request.save();
    
    // NOTIFY ALL ADMINS
    const admins = await User.find({ role: "admin" }).select("_id");
    
    const notifications = admins.map((admin) => ({
      user: admin._id,
      message: `New request created by ${req.user.name}: "${title}"`,
      link: "/requests",
    }));

    await Notification.insertMany(notifications);
    //res
    res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//getting user request
export const getRequests = async (req, res) => {
  try {
    //getting user requests
    const requests = await Request.find({
      createdBy: req.user._id,
    })
      .populate("assignedTo", "name email").populate("history.by", "name role")
      .sort({ updatedAt: -1 });
  //res
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
//getting manager request
export const getManagerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ assignedTo: req.user._id }).populate("createdBy", "name email").populate("history.by", "name role");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// MANAGER → approve / reject
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, remark } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Request already processed",
      });
    }

    // manager can only update their own assigned requests
    if (request.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    request.status = status;
    request.remark = remark;
    request.history.push({ action: status, by: req.user._id, remark: remark });
    await request.save();
    await Notification.create({
      user: request.createdBy,
      message: `Your request "${request.title}" was ${status}`,
      link: "/requests",
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to update request" });
  }
};


// ADMIN → get all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("createdBy", "name role")
      .populate("assignedTo", "name role").populate("history.by", "name role");;

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all requests" });
  }
};

//assign request
// ADMIN → assign request to manager
export const assignRequest = async (req, res) => {
  try {
    const { managerId } = req.body;

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Cannot assign a processed request",
      });
    }

    const manager = await User.findById(managerId);
    if (!manager || manager.role !== "manager") {
      return res.status(400).json({ message: "Invalid manager" });
    }

    request.assignedTo = managerId;
    request.history.push({ action: "assigned", by: req.user._id, remark: `Assigned to ${manager.name}` });

    await request.save();
    await Notification.create({
      user: managerId,
      message: `You have a new request assigned to you by ${req.user.name} and the title is ${request.title}`,
      link: "/requests",
    })

    res.json({
      message: "Request assigned successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign request" });
  }
};
