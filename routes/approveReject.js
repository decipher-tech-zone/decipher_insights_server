const express = require("express");
const router = express.Router();
const WFHRequest = require("../models/WFHRequest");

// ✅ PATCH /api/wfh/approve/:id — approve or reject a WFH request
router.patch("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    // Validate approved flag
    if (typeof approved !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Approved status must be true or false.",
      });
    }

    // Update document
    const updatedRequest = await WFHRequest.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, error: "WFH request not found." });
    }

    res.status(200).json({
      success: true,
      message: `WFH request ${approved ? "approved" : "rejected"} successfully.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("❌ Error approving WFH request:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ✅ You must export the router so Express can use it
module.exports = router;
