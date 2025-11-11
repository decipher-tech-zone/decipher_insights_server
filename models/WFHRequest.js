const mongoose = require("mongoose");

const WFHRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    lastNonStandardMonth: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    numWfhDays: {
      type: Number,
      required: true,
      min: 1,
    },
    approved: {
      type: Boolean,
      default: null, // ✅ better than false (null = pending)
    },
  },
  { timestamps: true } // ✅ automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("WFHRequest", WFHRequestSchema);
