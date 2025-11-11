const express = require("express");
const router = express.Router();
const WFHRequest = require("../models/WFHRequest");

// ✅ POST /api/wfh/request
router.post("/request", async (req, res) => {
  try {
    const {
      name,
      email,
      startDate,
      endDate,
      lastNonStandardMonth,
      reason,
      numWfhDays,
    } = req.body;

    // ✅ Basic validation
    if (
      !name ||
      !email ||
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

    // ✅ Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a valid email address." });
    }

    // ✅ Create a new request (approved defaults to null automatically)
    const newRequest = new WFHRequest({
      name,
      email,
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
