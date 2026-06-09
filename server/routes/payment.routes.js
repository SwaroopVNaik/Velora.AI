import express from "express"
import {
    createPayment,
    getPaymentHistory,
    paymentFailure,
    paymentSuccess
} from "../controllers/payment.controller.js"
import isAuth from "../middlewares/isAuth.js"
import { rateLimit } from "express-rate-limit"

const paymentRouter=express.Router()
const paymentLimiter=rateLimit({
    windowMs:15*60*1000,
    limit:30,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{message:"Too many payment requests. Please try again later."}
})

const requireMockPayments=(req,res,next)=>{
    const enabled=process.env.NODE_ENV !== "production" ||
        process.env.MOCK_PAYMENTS_ENABLED === "true"

    if(!enabled){
        return res.status(503).json({
            message:"Mock payments are disabled in this environment"
        })
    }

    next()
}

paymentRouter.use(paymentLimiter,isAuth,requireMockPayments)
paymentRouter.post("/create",createPayment)
paymentRouter.post("/success",paymentSuccess)
paymentRouter.post("/failure",paymentFailure)
paymentRouter.get("/history",getPaymentHistory)

export default paymentRouter
