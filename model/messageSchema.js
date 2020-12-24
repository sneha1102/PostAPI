const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    roomId: String,
  },
  {
    timestamps: true,
  }
);
messagesSchema.index({ senderId: 1, receiverId: 1 });
const Message = mongoose.model("Message", messagesSchema);
module.exports = Message;
