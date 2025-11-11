const express = require("express");
const router = express.Router();
const WFHRequest = require("../models/WFHRequest");
const nodemailer = require("nodemailer");

// ✅ Approve or reject a WFH request
router.patch("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false

    // ✅ Update request in MongoDB
    const request = await WFHRequest.findByIdAndUpdate(
      id,
      { approved },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        error: "WFH request not found",
      });
    }

    // ✅ Create transporter (for Gmail or any SMTP service)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Define dynamic subject and message
    const subject = approved
      ? "✅ Your WFH Request Has Been Approved"
      : "❌ Your WFH Request Has Been Rejected";

    const statusMessage = approved
      ? `<p style="color:green;">Your WFH request has been approved .</p>`
      : `<p style="color:red;">Unfortunately, your WFH request has been rejected.</p>`;

    // ✅ Send email to the employee
    await transporter.sendMail({
      from: `"Decipher Insights" <${process.env.EMAIL_USER}>`,
      to: request.email,
      subject,
      html: `
        <div style="font-family:Arial, sans-serif; line-height:1.5; max-width:600px;">
          <h2>Hello ${request.name},</h2>
          ${statusMessage}
          <p><b>WFH Period:</b> ${request.startDate} → ${request.endDate}</p>
          <p><b>Reason:</b> ${request.reason}</p>
          <p><b>Requested Days:</b> ${request.numWfhDays}</p>
          <br/>
          <p style="font-size:13px;color:#777;">
            This is an automated notification from the WFH Approval System.
          </p>
        </div>
      `,
    });

    console.log(`✅ Email sent to ${request.email}: ${subject}`);

    return res.status(200).json({
      success: true,
      message: `Request ${approved ? "approved" : "rejected"} and email sent.`,
      data: request,
    });
  } catch (error) {
    console.error("❌ Error approving/rejecting request:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
