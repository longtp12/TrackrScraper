import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    profilePicture: { type: String },
    isAdmin: { type: Boolean, default: false },
    isDisabled:{type:Boolean, default: false},
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
