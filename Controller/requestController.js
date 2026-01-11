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