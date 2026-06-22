import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 600
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: 10,
      maxlength: 1500
    },
    type: {
      type: String,
      required: true,
      enum: ["lost", "found"]
    },
    category: {
      type: String,
      required: true,
      enum: [
        "ID & Cards",
        "Electronics",
        "Wallets & Bags",
        "Books & Notes",
        "Keys",
        "Clothing",
        "Accessories",
        "Other"
      ]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 120
    },
    incidentDate: {
      type: Date,
      required: [true, "Date is required"]
    },
    image: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["open", "resolved", "returned"],
      default: "open"
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    claims: [claimSchema]
  },
  { timestamps: true }
);

itemSchema.index({
  title: "text",
  description: "text",
  location: "text",
  category: "text"
});

export default mongoose.model("Item", itemSchema);

