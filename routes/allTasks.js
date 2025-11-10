const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User"); // Adjust the path as needed

const router = express.Router();

// Route to fetch all tasks for a particular day for all users
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ error: "Date query parameter is required" });
    }

    // Fetch users who have tasks on the given date
    const usersWithTasks = await User.find(
      { "dailyTasks.date": date },
      "name email dailyTasks"
    );

    // Filter out tasks for the given date
    const filteredTasks = usersWithTasks.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      tasks: user.dailyTasks.filter((task) => task.date === date),
    }));

    res.json(filteredTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch tasks for the last one month
router.get("/last-month", async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1); // Get the date one month ago

    // Fetch users who have tasks in the last month
    const usersWithTasks = await User.find(
      { "dailyTasks.date": { $gte: lastMonth.toISOString().split("T")[0] } },
      "name email dailyTasks"
    );

    // Filter out tasks within the last month
    const filteredTasks = usersWithTasks.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      tasks: user.dailyTasks.filter((task) => new Date(task.date) >= lastMonth),
    }));

    res.json(filteredTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch all tasks since the start
router.get("/all", async (req, res) => {
  try {
    // Fetch all users with their tasks
    const usersWithTasks = await User.find({}, "name email dailyTasks");

    // Format the response
    const allTasks = usersWithTasks.map((user) => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      tasks: user.dailyTasks, // No filtering, return all tasks
    }));

    res.json(allTasks);
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Normalize email (assuming emails are stored in lowercase)
    const normalizedEmail = email.toLowerCase();

    // Fetch the user by email with all required fields
    const user = await User.findOne(
      { email: normalizedEmail },
      "name email designation gender isAdmin organisation phone_number dailyTasks"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if today's task is available
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const taskAvailable = user.dailyTasks.some((task) => task.date === today);

    // Format the response
    const userTasks = {
      name: user.name,
      email: user.email,
      designation: user.designation,
      gender: user.gender,
      isAdmin: user.isAdmin,
      organisation: user.organisation,
      phoneNumber: user.phone_number,
      tasks: user.dailyTasks, // No filtering, return all tasks
      taskAvailable: taskAvailable,
    };

    res.json(userTasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route to fetch users who have NOT filled tasks for a given date
router.get("/not-filled", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ error: "Date query parameter is required" });
    }

    // Fetch all users with required fields
    const allUsers = await User.find({}, "name email dailyTasks");

    // Determine each user's task status for the given date
    const usersWithStatus = allUsers.map((user) => {
      const taskForDate = user.dailyTasks.find((task) => task.date === date);

      let status = "pending"; // default
      if (taskForDate) {
        if (taskForDate.tasks === "Leave") {
          status = "leave";
        } else {
          status = "filled";
        }
      }

      return {
        name: user.name,
        email: user.email,
        status,
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error("Error tagging user task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch users who have NOT filled tasks on one or more days in the last week
router.get("/not-filled/last-week", async (req, res) => {
  try {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 4); // Covers 7 days including today

    // Format dates into YYYY-MM-DD
    const dateRange = [];
    for (let d = new Date(oneWeekAgo); d <= today; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d).toISOString().split("T")[0]);
    }

    // Fetch all users
    const allUsers = await User.find({}, "name email dailyTasks");

    const usersWithMissingDates = allUsers
      .map((user) => {
        const userTaskDates = user.dailyTasks.map((task) => task.date);
        const missingDates = dateRange.filter(
          (date) => !userTaskDates.includes(date)
        );
        if (missingDates.length > 0) {
          return {
            userId: user._id,
            name: user.name,
            email: user.email,
            missingDates,
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries

    res.json(usersWithMissingDates);
  } catch (error) {
    console.error(
      "Error fetching users with missing tasks in last week:",
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/append-tasks', async (req, res) => {
  const taskData = req.body;

  try {
    for (const task of taskData) {
      const { name, ...dailyTaskEntry } = task;

      await User.findOneAndUpdate(
        { name },
        { $push: { dailyTasks: dailyTaskEntry } },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: 'Tasks appended successfully.' });
  } catch (error) {
    console.error('Error appending tasks:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


module.exports = router;
