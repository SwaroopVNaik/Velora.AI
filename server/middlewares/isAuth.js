import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { verifyFirebaseIdToken } from "../config/firebaseAuth.js"

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

const getBearerToken = (req) => {
    const authorization=req.get("authorization")
    if(!authorization){
        return null
    }

    const [scheme,token]=authorization.split(" ")
    return scheme?.toLowerCase() === "bearer" && token ? token : null
}

const findFirebaseUser = async (idToken) => {
    try {
        const firebaseUser=await verifyFirebaseIdToken(idToken)
        if(!firebaseUser.email || !firebaseUser.email_verified){
            return null
        }

        const normalizedEmail=firebaseUser.email.trim().toLowerCase()
        return User.findOne({
            $or:[
                {firebaseUid:firebaseUser.uid},
                {email:normalizedEmail}
            ]
        })
    } catch {
        return null
    }
}

const authenticateRequest = async (req,res) => {
    const cookieToken=req.cookies.token
    const bearerToken=getBearerToken(req)

    if(cookieToken){
        const decoded=decodeToken(cookieToken)
        if(decoded){
            const user=await User.findById(decoded.sub)
            if(user){
                return {user,hasCredentials:true}
            }
        }
        clearAuthCookie(res)
    }

    if(bearerToken){
        const user=await findFirebaseUser(bearerToken)
        if(user){
            return {user,hasCredentials:true}
        }
    }

    return {
        user:null,
        hasCredentials:Boolean(cookieToken || bearerToken)
    }
}

const isAuth=async (req,res,next)=>{
try {
    const {user,hasCredentials}=await authenticateRequest(req,res)
    if(!user){
        return res.status(401).json({
            message:hasCredentials ? "invalid or expired token" : "authentication required"
        })
    }

    req.user=user
    next()
} catch (error) {
    return res.status(500).json({message:"unable to authenticate user"})
}
}

export const optionalAuth=async (req,res,next)=>{
try {
    const {user}=await authenticateRequest(req,res)
    req.user=user

    next()
} catch (error) {
    return res.status(500).json({message:"unable to get current user"})
}
}

export default isAuth
