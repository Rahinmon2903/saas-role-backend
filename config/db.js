import mongoose from "mongoose";


const dbConnect=async (req,res) => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected");
    }catch(err){
        console.log(err);
        process.exit(1);
    }
    
}

export default dbConnect