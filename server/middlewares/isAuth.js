import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isProduction = process.env.NODE_ENV === "production"
const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path:"/"
}

const clearAuthCookie = (res) => {
    res.clearCookie("token",authCookieOptions)
}

const decodeToken = (token) => {
    try {
        return jwt.verify(token,process.env.JWT_SECRET,{
            issuer:"velora-api",
            audience:"velora-web"
        })
    } catch {
        return null
    }
}

const isAuth=async (req,res,next)=>{
try {
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({message:"authentication required"})
    }

     const decoded=decodeToken(token)
     if(!decoded){
        clearAuthCookie(res)
        return res.status(401).json({message:"invalid or expired token"})
     }

     req.user=await User.findById(decoded.sub)
     if(!req.user){
        clearAuthCookie(res)
        return res.status(401).json({message:"user not found"})
     }

     next()
} catch (error) {
    return res.status(500).json({message:"unable to authenticate user"})
}
}

export const optionalAuth=async (req,res,next)=>{
try {
    const token=req.cookies.token
    if(!token){
        return next()
    }

    const decoded=decodeToken(token)
    if(!decoded){
        clearAuthCookie(res)
        return next()
    }

    req.user=await User.findById(decoded.sub)
    if(!req.user){
        clearAuthCookie(res)
    }

    next()
} catch (error) {
    return res.status(500).json({message:"unable to get current user"})
}
}

export default isAuth
