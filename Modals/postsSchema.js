const mongoose=require('mongoose')
const postsSchema = new mongoose.Schema({
    postName: String,
    userName:String,
    description: String,
    _id: Number,
    likes:{type :Number,default :0},
    likeDetails: [{ type: Object, default: {} }],
    comments: [{type:Object,default:{}}],
   image:String,
   postDate:{ type: Date, default: Date.now }
})
module.exports= postsSchema;