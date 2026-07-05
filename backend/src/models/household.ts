import mongoose, { Schema, Document, Types } from "mongoose";

export interface IHousehold extends Document {
  name: string;
  inviteCode: string;
  members: Types.ObjectId[];
  wasteScore: number;
  createdAt: Date;
}

const householdSchema = new Schema<IHousehold>(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
      trim: true,
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      length: 6,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    wasteScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IHousehold>("Household", householdSchema);
