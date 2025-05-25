import mongoose, { Document, Schema } from "mongoose";
import { TAuth } from "../types/auth.types";

type partialAuth = Partial<TAuth>;

const Auth = new Schema<partialAuth>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]+$/, "Phone number must contain digits only"],
    },
    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character.",
      ],
    },
    token: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Auth", Auth);
