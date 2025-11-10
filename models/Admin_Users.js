const mongoose = require("mongoose");

const AdminUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  designation: {
    type: String,
    required: false,
  },
  organisation: {
    type: String,
    required: false,
  },
  admin:{
    type:Boolean,
    required: true
  }
});

// Avoid overwriting the model if it already exists
const Admin_User = mongoose.models.Admin_User || mongoose.model("Admin_User", AdminUserSchema);

module.exports = Admin_User;
