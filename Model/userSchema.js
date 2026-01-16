import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // username
    name: {
      type: String,
      required: true
    },
    //email
    email: {
      type: String,
      required: true,
      unique: true
    },
    //password
    password: {
      type: String,
      required: true
    },
    //in our system we have three roles the default one is user
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user"
    },
    //used for password reset
    resetToken: {
  type: String,
  default: null
},
//expire time
resetTokenExpire: {
  type: Date,
  default: null
}
  },
  { timestamps: true }
);

const User= mongoose.model("User", userSchema);
export default User;
