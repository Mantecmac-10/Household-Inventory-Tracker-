import mongoose, { Schema, Document, Types } from "mongoose";
export interface Iitem extends Document {
  householdId: Types.ObjectId;
  addedBy: Types.ObjectId;
  name: string;
  category: "produce" | "dairy" | "meat" | "pantry" | "frozen" | "other";
  quantity: number;
  expiryDate: Date;
  status: "fresh" | "expiring-soon" | "expired" | "used" | "wasted";
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<Iitem>(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["produce", "dairy", "meat", "pantry", "frozen", "other"],
      default: "other",
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["fresh", "expiring-soon", "expired", "used", "wasted"],
      default: "fresh",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<Iitem>("Item", itemSchema);
