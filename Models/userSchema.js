const mongoose = require("mongoose");
const usersSchema = new mongoose.Schema({
  id: Number,
  username: String,
  // senderMsgDetails:[{type:Object,default:{}}],
  // receiverMsgDetails:[{type:Object,default:{}}],

  msgDetails: [{ type: Object, default: {} }],
});
const User = mongoose.model("User", usersSchema);
module.exports = User;
