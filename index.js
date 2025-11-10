require('dotenv').config();
const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to DB
connectToMongo();

// ✅ Port
const port = process.env.PORT || 5050;


// ✅ Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/tasks"));
app.use("/app/tasks", require("./routes/allTasks"));

// ✅ WFH routes — all grouped under same prefix
app.use("/api/wfh", require("./routes/wfhRequest"));      // POST /request
app.use("/api/wfh", require("./routes/approveReject"));   // PATCH /approve/:id
app.use("/api/wfh", require("./routes/allWFHrequests"));  // GET /all

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.send("Decipher Insights");
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
