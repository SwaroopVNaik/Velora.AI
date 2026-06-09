import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"
import { rateLimit } from "express-rate-limit"

const authRouter=express.Router()
const authLimiter=rateLimit({
    windowMs:15*60*1000,
    limit:20,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{message:"Too many sign-in attempts. Please try again later."}
})

authRouter.post("/google",authLimiter,googleAuth)
authRouter.post("/logout",logOut)

export default authRouter

