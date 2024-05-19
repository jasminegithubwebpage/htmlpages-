const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/LoginSignupTutorial")
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});


const LogInSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const collection = new mongoose.model("Collection1",LogInSchema)

module.exports = collection