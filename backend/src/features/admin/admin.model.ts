import mongoose, { Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const admin = new mongoose.Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      required: [true, "role is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Admin = mongoose.model<IAdmin>("Admin", admin);
export default Admin;
