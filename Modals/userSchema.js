const mongoose=require('mongoose')
const usersSchema=new mongoose.Schema({
    _id:Number,
    username:String,
     senderMsgDetails:[{type:Object,default:{}}],
     receiverMsgDetails:[{type:Object,default:{}}],

    msgDetails:[{type:Object,default:{}}]
})
module.exports=usersSchema;