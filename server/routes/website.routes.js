import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { changes, deleteWebsite, deploy, generateWebsite, getAll, getBySlug, getWebsiteById } from "../controllers/website.controllers.js"
import { rateLimit } from "express-rate-limit"


const websiteRouter=express.Router()
const generationLimiter=rateLimit({
    windowMs:60*60*1000,
    limit:20,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{message:"Too many AI requests. Please try again later."}
})

websiteRouter.post("/generate",generationLimiter,isAuth,generateWebsite)
websiteRouter.post("/update/:id",generationLimiter,isAuth,changes)
websiteRouter.get("/get-by-id/:id",isAuth,getWebsiteById)
websiteRouter.get("/get-all",isAuth,getAll)
websiteRouter.delete("/delete/:id",isAuth,deleteWebsite)
websiteRouter.post("/deploy/:id",isAuth,deploy)
websiteRouter.get("/get-by-slug/:slug",getBySlug)

export default websiteRouter
