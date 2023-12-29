import mongoose from "mongoose";

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  type: {
      type: String,
      enum: ["deposit", "withdraw"],
      default: "deposit"
  },
  money: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    enum: [-1, 0, 1], // -1 :"failed", 0: "pending", 1: "succeess"
    default: 0
  }
}, {
  timestamps: true
});
export default mongoose.model("Transactions", Schema);
