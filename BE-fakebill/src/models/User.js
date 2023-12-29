import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { PERMISSIONS_LIST } from "../helpers/permissions.js"

const Schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  fullname: String,

  role: {
    type: Number,
    enum: [0, 1] // 0 admin, 1 người dùng
  },
  
  money: {
    type: Number,
    required: true,
    default: 0
  },
  permissions: [
    {
      type: String,
      enum: PERMISSIONS_LIST
    }
  ],
}, {
  timestamps: true
});

Schema.methods.comparePassword = function (rawPassword) {
  return bcrypt.compareSync(rawPassword, this.password)
};

Schema.methods.compareOneTimePassword = function (rawPassword) {
  return bcrypt.compareSync(rawPassword, this.oneTimePassword)
}

export default mongoose.model("User", Schema);
