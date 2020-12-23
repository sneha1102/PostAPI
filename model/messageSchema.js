const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", messagesSchema);
module.exports = Message;
