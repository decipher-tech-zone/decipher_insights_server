const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
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
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  organisation: {
    type: String,
    required: true,
  },
  isAdmin:{
    type: Boolean,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  dailyTasks: [{
    date: String,
    tasks: String,
    client: String,
    project: String,
    comments: String
  }]
});

const User = mongoose.model("User", UserSchema)
module.exports = User
