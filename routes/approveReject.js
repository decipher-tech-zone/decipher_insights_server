const express = require("express");
const router = express.Router();
const WFHRequest = require("../models/WFHRequest");
const nodemailer = require("nodemailer");

// ✅ Helper function for updating WFH request & sending email
async function handleApproval(id, approved) {
  // ✅ Update request in MongoDB
  const request = await WFHRequest.findByIdAndUpdate(
    id,
    { approved },
    { new: true }
  );

  if (!request) return null;

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
    ? `<p style="color:green;">Your WFH request has been approved.</p>`
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
  return request;
}

// ✅ PATCH endpoint for API calls (e.g., Postman, frontend)
router.patch("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // boolean

    const request = await handleApproval(id, approved);
    if (!request)
      return res.status(404).json({ success: false, error: "WFH request not found" });

    return res.status(200).json({
      success: true,
      message: `Request ${approved ? "approved" : "rejected"} and email sent.`,
      data: request,
    });
  } catch (error) {
    console.error("❌ Error approving/rejecting request:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// ✅ GET endpoint for email links
router.get("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const approved = req.query.approved === "true"; // convert query param to boolean

    const request = await handleApproval(id, approved);
    if (!request)
      return res.status(404).send("<h3>❌ WFH request not found.</h3>");

    const message = approved
      ? "✅ The WFH request has been approved successfully!"
      : "❌ The WFH request has been rejected.";

    return res.send(`
      <div style="font-family:Arial, sans-serif; text-align:center; margin-top:50px;">
        <h2>${message}</h2>
        <p><b>Employee:</b> ${request.name}</p>
        <p><b>WFH Period:</b> ${request.startDate} → ${request.endDate}</p>
        <p>Status has been updated in the system.</p>
      </div>
    `);
  } catch (error) {
    console.error("❌ Error approving/rejecting via email link:", error);
    return res.status(500).send("<h3>Internal Server Error</h3>");
  }
});

module.exports = router;
