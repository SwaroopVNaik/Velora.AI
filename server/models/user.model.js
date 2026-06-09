import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    firebaseUid:{
        type:String,
        unique:true,
        sparse:true,
        trim:true
    },
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:1,
        maxlength:100
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        maxlength:254,
        match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    avatar:{
        type:String,
        maxlength:2048
    },
    credits:{
        type:Number,
        default:100,
        min:0
    },
    plan:{
        type:String,
        enum:["free","pro","enterprise"],
        default:"free"
    }
},{timestamps:true})

const User=mongoose.model("User",userSchema)
export default User
