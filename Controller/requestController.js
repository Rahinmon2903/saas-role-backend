import Request from "../Model/requestSchema.js";


//create request

export const createRequest = async (req, res) => {
        try {
            // const { title, description } = req.body;
            const { title, description, managerId} = req.body;
            //
            const request = new Request({
                title,
                description,
                createdBy:req.user._id,
                assignedTo:managerId,
                
            });
           //save
            await request.save();
              //res
            res.status(201).json({ message: "Request created successfully", request });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    };

    //getting user request
    export const getRequests = async (req, res) => {
        try {
            const requests = await Request.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
            res.json(requests);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    };

  //getting manager request
    export const getManagerRequests = async (req, res) => {
        try {
            const requests = await Request.find({ assignedTo: req.user._id }).populate("createdBy","name email");
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

    // manager can only update their own assigned requests
    if (request.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    request.status = status;
    request.remark = remark;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to update request" });
  }
};