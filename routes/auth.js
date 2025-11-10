const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchUser = require("../middleware/fetchUser");
const Admin_User = require("../models/Admin_Users");

const JWT_SECRET = "Decipherproprietory";

//ROUTE 0 - Create a User using : POST "/api/auth/createadmin", This endpoint doesn't require auth----------------------

router.post(
  "/createadmin",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],

  // IF there are errors, return bad request and the errors

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check whether the user with this email exist already
    try {
      let user = await Admin_User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry the user with this email already exist" });
      }

      //Securing the password

      const salt = await bcrypt.genSalt(10);

      const secPass = await bcrypt.hash(req.body.password, salt);
      //Create a user
      user = await Admin_User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        phone_number: req.body.phone_number,
        gender: req.body.gender,
        designation: req.body.designation,
        organisation: req.body.organisation,
        admin: req.body.admin
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 1 - Create a User using : POST "/api/auth/createuser", This endpoint doesn't require auth----------------------

router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],

  // IF there are errors, return bad request and the errors

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check whether the user with this email exist already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry the user with this email already exist" });
      }

      //Securing the password

      const salt = await bcrypt.genSalt(10);

      const secPass = await bcrypt.hash(req.body.password, salt);
      //Create a user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        phone_number: req.body.phone_number,
        gender: req.body.gender,
        designation: req.body.designation,
        organisation: req.body.organisation,
        isAdmin: req.body.isAdmin
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 2 Authenticate a User using : Post"api/auth/login". No login required for this endpoint------------------------------

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      let userDetails = {};
      let allowedKeys = ["_id", "name", "email", "phone_number", "designation", "gender", "organisation", "dailyTasks", "isAdmin"];

      allowedKeys.forEach(key => {
        userDetails[key] = user[key];
      });

      // Check if today's task is available
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      const taskAvailable = user.dailyTasks.some(task => task.date === today);
      userDetails["taskAvailable"] = taskAvailable

      res.json({ authToken, userDetails });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);



//ROUTE 2.2 Authenticate an Admin User using : Post"api/auth/adminlogin". No login required for this endpoint------------------------------

router.post(
  "/adminlogin",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await Admin_User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);


// ROUTE 3 : Get logged in user details using POST "/api/auth/getuser" --------------------------------------------------------------------------------

router.post("/getUser", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ isValid: false, message: "User not found" });
    }

    res.status(200).json({ isValid: true, user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4 : Fetch all users list using get "/api/auth/getallusers" ---------------------------------------------------

router.get("/getallusers", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({}, { password: 0, date: 0, __v: 0, _id: 0 });

    // If no users are found, return a message
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Return the list of users
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4.4 : Fetch all Admin users list using get "/api/auth/getadminusers" ---------------------------------------------------

router.get("/getadminusers", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Admin_User.find({}, { password: 0, date: 0, __v: 0, _id: 0 });

    // If no users are found, return a message
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Return the list of users
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


// Route 5 : Reset password for normal user /api/auth/resetpassword -----------------------------------------------------


// Reset Password Endpoint
router.post(
  "/resetpassword",
  [
    body("email", "Enter a valid email").isEmail(),
    body("newPassword", "Password must be at least 5 characters long").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, newPassword } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(newPassword, salt);

      user.password = secPass;
      await user.save();

      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);






module.exports = router;
