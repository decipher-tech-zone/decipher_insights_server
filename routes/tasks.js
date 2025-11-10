const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Route to add a daily task for a user
router.post("/add-task", async (req, res) => {
  const { email, date, tasks, client, project, comments } = req.body;

  if (!email || !date || !tasks) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    // **1. Search for the user by `email` instead of `_id`**
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // **2. If found, update their `dailyTasks` array**
    user.dailyTasks.push({ date, tasks, client, project, comments });
    await user.save(); // Saves the changes

    let userDetails = {};
    let allowedKeys = [
      "_id",
      "name",
      "email",
      "phone_number",
      "designation",
      "gender",
      "organisation",
      "dailyTasks",
      "isAdmin",
    ];

    allowedKeys.forEach((key) => {
      userDetails[key] = user[key];
    });

    // Check if today's task is available
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const taskAvailable = user.dailyTasks.some((task) => task.date === today);
    userDetails["taskAvailable"] = taskAvailable;

    res
      .status(200)
      .json({ message: "Daily task added successfully", userDetails });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
});


// Route to edit an existing daily task for a user
router.put("/edit-task", async (req, res) => {
  const { email, date, tasks, client, project, comments } = req.body;

  if (!email || !date || !tasks) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the task for the given date
    const taskIndex = user.dailyTasks.findIndex((task) => task.date === date);
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found for the given date" });
    }

    // Update task fields
    user.dailyTasks[taskIndex] = { date, tasks, client, project, comments };
    await user.save();

    let userDetails = {};
    let allowedKeys = [
      "_id",
      "name",
      "email",
      "phone_number",
      "designation",
      "gender",
      "organisation",
      "dailyTasks",
      "isAdmin",
    ];

    allowedKeys.forEach((key) => {
      userDetails[key] = user[key];
    });

    userDetails["taskAvailable"] = true

    res.status(200).json({ message: "Daily task updated successfully", userDetails });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
});




module.exports = router;
