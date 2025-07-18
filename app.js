
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const admin = require("./firebase");
const User = require("./models/Users");

dotenv.config()

const app = express()
app.use(bodyParser.json())

const cors = require('cors')
app.use(cors())



    mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("MongoDB connected"))
    .catch(err=>console.error("MongoDB connection error:", err));
    
    app.get('/', (req, res) => {
  res.send('Backend running successfully!');
});

async function verifyToken(req, res, next) {
  const idToken = req.headers.authorization;
  console.log("Received token:", idToken);
  if (!idToken) {
    return res.status(401).send("Unauthorized: No token");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded token:", decodedToken);
    req.user = decodedToken;
    next();
    
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).send("Unauthorized: " + error.message);
  }
}


    app.post("/api/protected",verifyToken,async(req,res)=>{
      console.log("Verified user:", req.user);
        const {uid,name,email,picture}=req.user
        try{
        let user = await User.findOne({uid})

        if(!user){
            user =new User({uid,name,email,picture})
            await user.save()

        }
        res.json(user)
        res.status(201).json({message:"Token verifyed successfully"})
      
        console.log("Verified Succfully")
      
      
  }
 
catch (error) {
    console.error("Error in /api/protected:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
});
  
  

   const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

