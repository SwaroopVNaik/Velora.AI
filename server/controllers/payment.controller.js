import crypto from "crypto"
import mongoose from "mongoose"
import { PLANS } from "../config/plan.js"
import Transaction from "../models/transaction.model.js"
import User from "../models/user.model.js"

const getPaidPlan = (planType) => {
    const plan = PLANS[planType]
    return plan && plan.price > 0 ? plan : null
}

const createTransactionId = () => {
    const prefix = Math.random() > 0.5 ? "VEL" : "PAY"
    return `${prefix}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`
}

const generateUniqueTransactionId = async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
        const transactionId = createTransactionId()
        const exists = await Transaction.exists({transactionId})

        if(!exists){
            return transactionId
        }
    }

    throw new Error("unable to generate a unique transaction id")
}

const paymentError = (message,status=400) => {
    const error = new Error(message)
    error.status = status
    return error
}

export const createPayment=async (req,res) => {
    try {
        const {plan:planType}=req.body
        if(typeof planType !== "string"){
            return res.status(400).json({message:"plan must be a string"})
        }

        const plan=getPaidPlan(planType)

        if(!plan){
            return res.status(400).json({message:"invalid paid plan"})
        }

        const transaction=await Transaction.create({
            transactionId:await generateUniqueTransactionId(),
            userId:req.user._id,
            plan:plan.plan,
            amount:plan.price,
            status:"pending"
        })

        return res.status(201).json({
            transactionId:transaction.transactionId,
            plan:transaction.plan,
            amount:transaction.amount,
            status:transaction.status
        })
    } catch {
        return res.status(500).json({message:"Unable to create payment"})
    }
}

export const paymentSuccess=async (req,res) => {
    let session

    try {
        session=await mongoose.startSession()
        const {transactionId}=req.body

        if(typeof transactionId !== "string" || !transactionId){
            return res.status(400).json({message:"transaction id is required"})
        }

        let transaction
        let user

        await session.withTransaction(async () => {
            transaction=await Transaction.findOne({
                transactionId,
                userId:req.user._id
            }).session(session)

            if(!transaction){
                throw paymentError("transaction not found",404)
            }

            if(transaction.status === "failed"){
                throw paymentError("failed transaction cannot be completed",409)
            }

            if(transaction.status === "success"){
                user=await User.findById(req.user._id).session(session)
                return
            }

            const plan=getPaidPlan(transaction.plan)
            if(!plan){
                throw paymentError("transaction plan is invalid")
            }

            user=await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set:{plan:plan.plan},
                    $inc:{credits:plan.credits}
                },
                {new:true,session}
            )

            if(!user){
                throw paymentError("user not found",404)
            }

            transaction.status="success"
            await transaction.save({session})
        })

        return res.status(200).json({
            message:"Payment Successful",
            subMessage:"Subscription Activated",
            transaction,
            user
        })
    } catch (error) {
        return res.status(error.status || 500).json({
            message:error.status ? error.message : "Unable to complete payment"
        })
    } finally {
        if(session){
            await session.endSession()
        }
    }
}

export const paymentFailure=async (req,res) => {
    try {
        const {transactionId}=req.body

        if(typeof transactionId !== "string" || !transactionId){
            return res.status(400).json({message:"transaction id is required"})
        }

        const transaction=await Transaction.findOne({
            transactionId,
            userId:req.user._id
        })

        if(!transaction){
            return res.status(404).json({message:"transaction not found"})
        }

        if(transaction.status === "success"){
            return res.status(409).json({message:"successful transaction cannot be failed"})
        }

        if(transaction.status !== "failed"){
            transaction.status="failed"
            await transaction.save()
        }

        return res.status(200).json({
            message:"Payment Failed",
            subMessage:"Please Try Again",
            transaction
        })
    } catch {
        return res.status(500).json({message:"Unable to record failed payment"})
    }
}

export const getPaymentHistory=async (req,res) => {
    try {
        const transactions=await Transaction.find({
            userId:req.user._id,
            status:{$in:["success","failed"]}
        }).sort({createdAt:-1})

        return res.status(200).json(transactions)
    } catch {
        return res.status(500).json({message:"Unable to load payment history"})
    }
}
