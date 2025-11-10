const express = require("express");
const router = express.Router();
const WFHRequest = require("../models/WFHRequest");

// ✅ POST /api/wfh/request
router.post("/request", async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      lastNonStandardMonth,
      reason,
      numWfhDays,
    } = req.body;

    // ✅ Basic validation
    if (
      !name ||
      !startDate ||
      !endDate ||
      !lastNonStandardMonth ||
      !reason ||
      !numWfhDays
    ) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required." });
    }

    // ✅ Create a new request (approved defaults to null automatically)
    const newRequest = new WFHRequest({
      name,
      startDate,
      endDate,
      lastNonStandardMonth,
      reason,
      numWfhDays,
    });

    // ✅ Save to MongoDB
    const savedRequest = await newRequest.save();

    console.log("✅ WFH Request saved:", savedRequest);

    return res.status(201).json({
      success: true,
      message: "WFH request submitted and saved successfully.",
      data: savedRequest,
    });
  } catch (error) {
    console.error("❌ Error saving WFH request:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
