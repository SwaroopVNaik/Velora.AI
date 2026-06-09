import express from "express"
import {  getCurrentUser } from "../controllers/user.controllers.js"
import { optionalAuth } from "../middlewares/isAuth.js"


const userRouter=express.Router()

userRouter.get("/me",optionalAuth,getCurrentUser)


export default userRouter
