const mongoose = require("mongoose");
const usersSchema = new mongoose.Schema({
  username: String,
  msgDetails: [{ type: Object, default: {} }],
});
const User = mongoose.model("User", usersSchema);
module.exports = User;
