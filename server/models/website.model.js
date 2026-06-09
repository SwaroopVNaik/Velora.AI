import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    role:{
        type:String,
        enum:["ai","user"],
        required:true
    },
    content:{
        type:String,
        required:true,
        maxlength:10000
    }
},{timestamps:true})


const websiteSchema=new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        default:"Untitled Website",
        trim:true,
        maxlength:120
    },
    latestCode:{
        type:String,
        required:true,
        maxlength:2_000_000
    },
    conversation:[
        messageSchema
    ],
    deployed:{
        type:Boolean,
        default:false
    },
    deployUrl:{
        type:String,
    },
    slug:{
        type:String,
        unique:true,
        sparse: true,
    }

},{timestamps:true})

websiteSchema.index({user:1,updatedAt:-1})

const Website=mongoose.model("Website",websiteSchema)
export default Website
