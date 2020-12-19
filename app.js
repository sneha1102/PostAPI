const express=require('express')
const mongoose=require('mongoose')
const postsSchema=require("./Modals/postsSchema")
const app = express();
const verifyToken=require("./jwt/verify")
const jwt=require('jsonwebtoken')
const userSchema=require("./Modals/userSchema")
mongoose.connect('mongodb://localhost/PostDB',{ useUnifiedTopology: true , useNewUrlParser: true })
    .then(() => console.log('Connected To mongodb'))
    .catch((err) => console.log('Exception Occured ', err));

mongoose.set('useFindAndModify', false);


const Post = mongoose.model('Post', postsSchema);
const User = mongoose.model('User', userSchema);
app.use(express.json());

app.post('/post',verifyToken, (req, res) => {
    const post = new Post(req.body);
    post.save().then((post) => res.send(post)).catch((err) => console.log('Exception Occured ', err));;
});

app.patch('/posts/comment',verifyToken,(req,res)=>{
    const id=req.query._id;
    Post.findByIdAndUpdate(id, { "$push": { "comments": req.body.comments } },{new:true}).then((result)=>{
        if(!result){
            res.status(404).send("Post does not exist");
            return;
        }
        res.send(result);
    })
})

app.patch('/posts',verifyToken,(req,res)=>{
    const id=req.query._id;
    const isLiked=req.query.likes;
    if(isLiked){
    Post.findByIdAndUpdate(id, { "$inc": { "likes": 1 } },{new:true}).then((result)=>{
        if(!result){
            res.status(404).send("Post does not exist");
            return;
        }
        res.send(result);
    })
}
})

app.delete('/posts',verifyToken, (req, res) => {
    const id = req.query._id;
    Post.findByIdAndDelete(id).then((result)=> {
        if(!result) {
            res.status(404).send("Post not found");
            return;
        }
        res.send(result);
    });
});

app.get('/posts',verifyToken,(req,res)=>{
    
    Post.find().then((result)=>{
        if(!result){
            res.status(404).send("There is no posts in database");
            return;
        }
        res.send(result);
    })
})

app.post('/users', (req, res) => {
    const user = new User(req.body);
    var token = jwt.sign({userid:req.body._id }, process.env.secret, {
      expiresIn: 86400 // expires in 24 hours
      });
      
    user.save().then((user) => res.send(user+'\n'+token)).catch((err) => console.log('Exception Occured ', err));;
});

app.get('/users',verifyToken,(req,res)=>{
    const senderId=req.query.senderId;
    const receiverId=req.query.receiverId;
    if(senderId){
    User.findById(senderId).then((result)=>{
        if(!result){
            res.status(404).send("No message send by this user");
            return;
        }else{
        res.send(result.senderMsgDetails);
        }
    })
    }else if(receiverId){
        User.findById(receiverId).then((result)=>{
            if(!result){
                res.status(404).send("No message received by this user");
                return;
            }else{
            res.send(result.receiverMsgDetails);
            }
        })
    }
})

function sortFunction(a,b){  
    var dateA = new Date(a.date).getTime();
    var dateB = new Date(b.date).getTime();
    return dateA > dateB ? -1 : 1;  
}; 

app.get('/users/message',(req,res)=>{
    const id=req.query._id;
    User.findById(id).then((result)=>{
        if(!result){
            res.status(404).send("No message send by this user");
            return;
        }else{
            let msgDetail=result.senderMsgDetails;
            let receiverMsgDetail=result.receiverMsgDetails;
            
            Array.prototype.push.apply(msgDetail,receiverMsgDetail); 
           msgDetail.sort(sortFunction)
        res.send(result.senderMsgDetails);
        }
    })
    
})

app.patch('/users/message',verifyToken,(req,res)=>{
    const senderId=req.query.senderId;
    const receiverId=req.body.receiverId;
    const message=req.body.message;
    const date=new Date();
    let output;
    User.findByIdAndUpdate(senderId, { "$push": { "senderMsgDetails":{"id":receiverId,"message":message,"date":date} } },{new:true}).then((result)=>{
        if(!result){
            res.status(404).send("User does not exist");
            return;
        }
        output=result;
    })
User.findByIdAndUpdate(receiverId, { "$push": { "receiverMsgDetails":{"id":senderId,"message":message,"date":date} } },{new:true}).then((result)=>{
        if(!result){
            res.status(404).send("User does not exist");
            return;
        }
       output+='\n'+result
    }).then(()=>{
        res.send(output)
    }
    )
})

app.listen(3000, () => console.log('Listening'));