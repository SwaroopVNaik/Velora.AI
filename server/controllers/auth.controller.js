import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { verifyFirebaseIdToken } from "../config/firebaseAuth.js"

const isProduction = process.env.NODE_ENV === "production"
const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path:"/"
}

export const googleAuth=async (req,res)=>{
try {
    const {idToken}=req.body
    if(typeof idToken !== "string" || !idToken){
        return res.status(400).json({
            message:"Firebase ID token is required"
        })
    }

    let firebaseUser
    try {
        firebaseUser=await verifyFirebaseIdToken(idToken)
    } catch {
        return res.status(401).json({message:"Google sign-in token is invalid or expired"})
    }

    if(!firebaseUser.email || !firebaseUser.email_verified){
        return res.status(401).json({message:"A verified Google account is required"})
    }

    const normalizedEmail=firebaseUser.email.trim().toLowerCase()
    let user=await User.findOne({
        $or:[
            {firebaseUid:firebaseUser.uid},
            {email:normalizedEmail}
        ]
    })

    if(!user){
      user=await User.create({
        firebaseUid:firebaseUser.uid,
        name:firebaseUser.name?.trim() || normalizedEmail.split("@")[0],
        email:normalizedEmail,
        avatar:firebaseUser.picture
      })
    }else{
        user.firebaseUid=firebaseUser.uid
        user.name=firebaseUser.name?.trim() || user.name
        user.avatar=firebaseUser.picture || user.avatar
        await user.save()
    }

    const token=jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            subject:user._id.toString(),
            issuer:"velora-api",
            audience:"velora-web",
            expiresIn:"7d"
        }
    )

    res.cookie("token",token,{
        ...authCookieOptions,
        maxAge:7*24*60*60*1000
    })

    return res.status(200).json(user)
} catch (error) {
    return res.status(500).json({message:"Unable to complete Google sign-in"})
}
}


export const logOut=async (req,res)=>{
try {
     res.clearCookie("token",authCookieOptions)

    return res.status(200).json({message :"log out successfully"})
} catch {
    return res.status(500).json({message:"Unable to log out"})
}
}
