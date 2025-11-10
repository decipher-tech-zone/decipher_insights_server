const express = require("express");
const router = express.Router();
const WFHRequest = require("../models/WFHRequest");

router.get("/all", async (req, res) => {
  try {
    const requests = await WFHRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Error fetching WFH requests:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;

