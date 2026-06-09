import axios from "axios"
import { ArrowLeft, ReceiptText } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { serverUrl } from "../config"

const formatAmount = (amount) => new Intl.NumberFormat("en-IN", {
    style:"currency",
    currency:"INR",
    maximumFractionDigits:0
}).format(amount)

function PaymentHistory() {
    const navigate=useNavigate()
    const [transactions,setTransactions]=useState([])
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState("")

    useEffect(() => {
        const getHistory=async () => {
            try {
                const response=await axios.get(`${serverUrl}/api/payment/history`,{
                    withCredentials:true
                })
                setTransactions(response.data || [])
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load payment history")
            } finally {
                setLoading(false)
            }
        }

        getHistory()
    },[])

    return (
        <div className='relative min-h-screen overflow-hidden bg-[#050505] px-4 pb-20 pt-10 text-white sm:px-6'>
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]' />
                <div className='absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[120px]' />
            </div>

            <div className='relative z-10 mx-auto max-w-6xl'>
                <button
                    type='button'
                    onClick={() => navigate("/pricing")}
                    className='mb-10 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white'
                >
                    <ArrowLeft size={16} />
                    Back to pricing
                </button>

                <div className='mb-10'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-indigo-300'>
                        <ReceiptText size={22} />
                    </div>
                    <h1 className='mt-5 text-3xl font-bold sm:text-4xl'>Payment history</h1>
                    <p className='mt-2 text-zinc-400'>Review your mock subscription transactions.</p>
                </div>

                <div className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl'>
                    {loading && <div className='p-10 text-center text-zinc-400'>Loading transactions...</div>}
                    {error && !loading && <div className='p-10 text-center text-red-400'>{error}</div>}
                    {!loading && !error && transactions.length === 0 && (
                        <div className='p-12 text-center text-zinc-400'>No completed payment transactions yet.</div>
                    )}

                    {!loading && !error && transactions.length > 0 && (
                        <>
                            <div className='hidden grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr] gap-4 border-b border-white/10 px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500 md:grid'>
                                <span>Transaction ID</span>
                                <span>Plan</span>
                                <span>Amount</span>
                                <span>Status</span>
                                <span>Date</span>
                            </div>

                            <div className='divide-y divide-white/10'>
                                {transactions.map((transaction) => (
                                    <div
                                        key={transaction._id}
                                        className='grid gap-4 px-5 py-5 text-sm md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr] md:items-center md:px-6'
                                    >
                                        <div>
                                            <p className='text-xs text-zinc-500 md:hidden'>Transaction ID</p>
                                            <p className='mt-1 font-mono text-zinc-200 md:mt-0'>{transaction.transactionId}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-zinc-500 md:hidden'>Plan</p>
                                            <p className='mt-1 capitalize text-zinc-300 md:mt-0'>{transaction.plan}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-zinc-500 md:hidden'>Amount</p>
                                            <p className='mt-1 text-zinc-300 md:mt-0'>{formatAmount(transaction.amount)}</p>
                                        </div>
                                        <div>
                                            <p className='text-xs text-zinc-500 md:hidden'>Status</p>
                                            <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize md:mt-0 ${
                                                transaction.status === "success"
                                                    ? "bg-emerald-500/15 text-emerald-400"
                                                    : "bg-red-500/15 text-red-400"
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className='text-xs text-zinc-500 md:hidden'>Date</p>
                                            <p className='mt-1 text-zinc-400 md:mt-0'>
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentHistory
