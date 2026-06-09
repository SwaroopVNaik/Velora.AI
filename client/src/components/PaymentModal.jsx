import axios from "axios"
import { CheckCircle2, CreditCard, ShieldCheck, X, XCircle } from "lucide-react"
import { AnimatePresence, motion as Motion } from "motion/react"
import { useState } from "react"
import { serverUrl } from "../config"

function PaymentModal({payment,onClose,onSuccess}) {
    const [processing,setProcessing]=useState(false)
    const [result,setResult]=useState(null)
    const [error,setError]=useState("")

    const completePayment=async (outcome) => {
        setProcessing(true)
        setError("")

        try {
            const endpoint=outcome === "success" ? "success" : "failure"
            const response=await axios.post(
                `${serverUrl}/api/payment/${endpoint}`,
                {transactionId:payment.transactionId},
                {withCredentials:true}
            )

            setResult({
                type:outcome,
                message:response.data.message,
                subMessage:response.data.subMessage
            })

            if(outcome === "success"){
                onSuccess(response.data.user)
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to process the mock payment")
        } finally {
            setProcessing(false)
        }
    }

    return (
        <AnimatePresence>
            <Motion.div
                className='fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4'
                role='dialog'
                aria-modal='true'
                aria-labelledby='payment-title'
                initial={{opacity:0}}
                animate={{opacity:1}}
                exit={{opacity:0}}
                onClick={!processing ? onClose : undefined}
            >
                <Motion.div
                    initial={{opacity:0,scale:0.92,y:30}}
                    animate={{opacity:1,scale:1,y:0}}
                    exit={{opacity:0,scale:0.95,y:20}}
                    onClick={(event) => event.stopPropagation()}
                    className='relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] p-7 shadow-2xl'
                >
                    {!processing && (
                        <button
                            type='button'
                            aria-label='Close payment modal'
                            onClick={onClose}
                            className='absolute right-5 top-5 text-zinc-500 transition hover:text-white'
                        >
                            <X size={19} />
                        </button>
                    )}

                    {!result ? (
                        <>
                            <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300'>
                                <CreditCard size={23} />
                            </div>

                            <p className='mt-6 text-xs font-medium uppercase tracking-[0.2em] text-indigo-300'>
                                Mock Payment Gateway
                            </p>
                            <h2 id='payment-title' className='mt-2 text-2xl font-semibold'>Complete your payment</h2>
                            <p className='mt-2 text-sm leading-6 text-zinc-400'>
                                Demo checkout for portfolio presentation. No real payment will be processed.
                            </p>

                            <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-5'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm text-zinc-400'>Plan</span>
                                    <span className='font-semibold capitalize'>{payment.plan}</span>
                                </div>
                                <div className='mt-3 flex items-center justify-between'>
                                    <span className='text-sm text-zinc-400'>Amount</span>
                                    <span className='text-xl font-semibold'>₹{payment.amount}</span>
                                </div>
                                <div className='mt-3 border-t border-white/10 pt-3'>
                                    <p className='text-xs text-zinc-500'>Transaction ID</p>
                                    <p className='mt-1 font-mono text-sm text-zinc-300'>{payment.transactionId}</p>
                                </div>
                            </div>

                            {error && <p className='mt-4 text-sm text-red-400' role='alert'>{error}</p>}

                            <div className='mt-6 grid gap-3'>
                                <button
                                    type='button'
                                    disabled={processing}
                                    onClick={() => completePayment("success")}
                                    className='flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    <CheckCircle2 size={18} />
                                    {processing ? "Processing..." : "Successful Payment"}
                                </button>
                                <button
                                    type='button'
                                    disabled={processing}
                                    onClick={() => completePayment("failure")}
                                    className='flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    <XCircle size={18} />
                                    Failed Payment
                                </button>
                            </div>

                            <div className='mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500'>
                                <ShieldCheck size={14} />
                                Safe demonstration environment
                            </div>
                        </>
                    ) : (
                        <div className='py-5 text-center'>
                            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                                result.type === "success"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "bg-red-500/15 text-red-400"
                            }`}>
                                {result.type === "success"
                                    ? <CheckCircle2 size={32} />
                                    : <XCircle size={32} />
                                }
                            </div>
                            <h2 className='mt-6 text-2xl font-semibold'>{result.message}</h2>
                            <p className='mt-2 text-zinc-400'>{result.subMessage}</p>
                            <p className='mt-5 font-mono text-xs text-zinc-500'>{payment.transactionId}</p>
                            <button
                                type='button'
                                onClick={onClose}
                                className='mt-7 w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:bg-zinc-200'
                            >
                                Done
                            </button>
                        </div>
                    )}
                </Motion.div>
            </Motion.div>
        </AnimatePresence>
    )
}

export default PaymentModal
