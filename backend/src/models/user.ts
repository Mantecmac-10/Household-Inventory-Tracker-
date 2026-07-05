import mongoose, { Schema, Document, Types } from "mongoose";

export interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
  householdId?: Types.ObjectId | null;
  createdAt: Date;
}

const userSchema = new Schema<Iuser>(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 30,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<Iuser>("User", userSchema);