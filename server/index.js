import "./config/env.js"
import express from "express"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import websiteRouter from "./routes/website.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import helmet from "helmet"
import { rateLimit } from "express-rate-limit"

const app=express()

const port=process.env.PORT || 5000
if(process.env.NODE_ENV === "production"){
    app.set("trust proxy",1)
}

const allowedOrigins=(process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin)=>origin.trim().replace(/\/$/,""))
    .filter(Boolean)

const requiredEnvironmentVariables=["MONGODB_URL","JWT_SECRET","OPENROUTER_API_KEY"]
for(const variable of requiredEnvironmentVariables){
    if(!process.env[variable]){
        throw new Error(`${variable} is required`)
    }
}

if(process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32){
    throw new Error("JWT_SECRET must be at least 32 characters in production")
}

app.disable("x-powered-by")
app.use(helmet({
    crossOriginResourcePolicy:{policy:"cross-origin"}
}))
app.use(express.json({limit:"1mb"}))
app.use(cookieParser())
app.use(cors({
    origin(origin,callback){
        if(!origin || allowedOrigins.includes(origin.replace(/\/$/,""))){
            return callback(null,true)
        }
        return callback(new Error("Origin is not allowed"))
    },
    credentials:true
}))
app.use((req,res,next)=>{
    const origin=req.get("origin")
    const isStateChanging=["POST","PUT","PATCH","DELETE"].includes(req.method)

    if(isStateChanging && origin && !allowedOrigins.includes(origin.replace(/\/$/,""))){
        return res.status(403).json({message:"Request origin is not allowed"})
    }

    next()
})
app.use(rateLimit({
    windowMs:15*60*1000,
    limit:150,
    standardHeaders:"draft-8",
    legacyHeaders:false
}))
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/website",websiteRouter)
app.use("/api/payment",paymentRouter)

app.use((req,res)=>{
    return res.status(404).json({message:"Route not found"})
})

app.use((error,req,res,next)=>{
    if(res.headersSent){
        return next(error)
    }

    if(error.message === "Origin is not allowed"){
        return res.status(403).json({message:"Request origin is not allowed"})
    }

    if(error.type === "entity.too.large"){
        return res.status(413).json({message:"Request body is too large"})
    }

    if(error instanceof SyntaxError && error.status === 400){
        return res.status(400).json({message:"Invalid JSON body"})
    }

    return res.status(500).json({message:"Internal server error"})
})

connectDb()
    .then(()=>{
        app.listen(port,()=>{
            console.log(`server started on port ${port}`)
        })
    })
    .catch(()=>{
        process.exitCode=1
    })
