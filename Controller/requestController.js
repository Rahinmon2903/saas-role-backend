import Notification from "../Model/notificationSchema.js";
import Request from "../Model/requestSchema.js";
import User from "../Model/userSchema.js";


//create request

export const createRequest = async (req, res) => {
  try {
    // const { title, description,priority,category } = req.body;
    const { title, description ,priority,category} = req.body;

      const slaMap = {
      low: 5,
      medium: 3,
      high: 2,
      critical: 1,
    };
   
    const dueDate=new Date();
    dueDate.setDate(
      dueDate.getDate() + slaMap[(priority ||"medium")]
    )
    //creating new request
    //the request can only created by user who is logged in and role should be user
    const request = new Request({
      title,
      description,
      priority,
      category,
      dueDate,
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
    //sending notification for all the admins in system
    const notifications = admins.map((admin) => ({
      user: admin._id,
      message: `New request created by ${req.user.name}: "${title}"`,
      link: "/requests",
    }));
    //insterting all the notification in database
    await Notification.insertMany(notifications);
    //res
    res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
//the user need the info about the manger and the manager need the info about user
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
    //getting manager requests and populate is just for displaying data in front-end
    const requests = await Request.find({ assignedTo: req.user._id }).populate("createdBy", "name email").populate("history.by", "name role");
    //response
    res.json(requests);
  } catch (error) {
    //error
    res.status(500).json({ message: "Server error" });
  }
};

// MANAGER → approve / reject
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, remark } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (request.status === "resolved" || request.status === "closed") {
      return res.status(400).json({
        message: "Ticket already processed",
      });
    }

    // manager can only update their own assigned requests
    if (request.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    if(request.status === "resolved" && !remark.trim()){
      return res.status(400).json({ message: "resolution mark required for resolved tickets" });
    }

    request.status = status;
    request.remark = remark;
    if(request.status === "resolved"){
      request.resolution=remark,
      request.closedAt=new Date()
    }
    request.history.push({ action: status, by: req.user._id, remark: remark });
    await request.save();
    await Notification.create({
      user: request.createdBy,
      message: `Your request "${request.title}" was ${status}`,
      link: "/requests",
    });
       res.status(200).json({
      message: "Ticket updated successfully",
      request,
    });
   
  } catch (error) {
    res.status(500).json({ message: "Failed to update Ticket" });
  }
};
//output of updateRequestStatus
/*
{
  "_id": "65f8ab12",

  "title": "Laptop Issue",

  "status": "approved",

  "remark": "Hardware problem verified",

  "createdBy": "user123",

  "assignedTo": "manager456",

  "history": [
    {
      "action": "approved",
      "by": "manager456",
      "remark": "Hardware problem verified",
      "_id": "hist789",
      "createdAt": "2026-02-11T10:15:30.000Z"
    }
  ],

  "createdAt": "2026-02-10T08:00:00.000Z",

  "updatedAt": "2026-02-11T10:15:30.000Z"
}
*/


// ADMIN → get all requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("createdBy", "name role")
      .populate("assignedTo", "name role").populate("history.by", "name role");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all requests" });
  }
};
//output of getAllRequests
/*
[
  {
    "_id": "req1",
    "title": "Laptop Issue",

    "createdBy": {
      "_id": "user1",
      "name": "Arjun",
      "role": "employee"
    },

    "assignedTo": {
      "_id": "manager1",
      "name": "Rahul",
      "role": "manager"
    },

    "history": [
      {
        "action": "Created",
        "by": {
          "_id": "user1",
          "name": "Arjun",
          "role": "employee"
        }
      },
      {
        "action": "Assigned",
        "by": {
          "_id": "admin1",
          "name": "Admin Kumar",
          "role": "admin"
        }
      }
    ]
  }
]
*/

//assign request
// ADMIN → assign request to manager
export const assignRequest = async (req, res) => {
  try {
    const { managerId } = req.body;
    console.log("managerId:", managerId);

    /* FIND TICKET */

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    /* VALIDATE STATUS */

    if (request.status !== "open") {
      return res.status(400).json({
        message: "Only open tickets can be assigned",
      });
    }

    /*  VALIDATE MANAGER */

    const manager = await User.findById(managerId);

    if (!manager || manager.role !== "manager") {
      return res.status(400).json({
        message: "Invalid manager",
      });
    }

    /*  UPDATE TICKET */

    request.assignedTo = managerId;
    request.status = "in_progress";

    request.history.push({
      action: "assigned",
      by: req.user._id,
      remark: `Assigned to ${manager.name}`,
    });

    await request.save();

    /* NOTIFY MANAGER */

    await Notification.create({
      user: managerId,
      message: `New ticket assigned: "${request.title}"`,
      link: "/requests",
    });

    /* RESPONSE */

    res.json({
      message: "Ticket assigned successfully",
      request,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to assign ticket",
    });
  }
};
