import React, { useState } from 'react'
import { AnimatePresence, motion as Motion } from "motion/react"
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from '../firebase'
import axios from "axios"
import { serverUrl } from '../config'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const getAuthErrorMessage = (error) => {
    if (error?.code === "auth/invalid-continue-uri" || error?.code === "auth/unauthorized-domain") {
        return "This app URL is not authorized in Firebase. Add localhost to Firebase Authentication's authorized domains."
    }
    if (error?.code === "auth/popup-closed-by-user") {
        return "Google sign-in was cancelled."
    }
    return error?.response?.data?.message || "Google sign-in could not be completed. Please try again."
}

function LoginModal({ open, onClose }) {
const dispatch=useDispatch()
const [isSigningIn,setIsSigningIn]=useState(false)
const [authError,setAuthError]=useState("")

    const handleGoogleAuth=async ()=>{
        if(isSigningIn) return

        setIsSigningIn(true)
        setAuthError("")
        try {
            const result=await signInWithPopup(auth,provider)
            const idToken=await result.user.getIdToken()
            const {data}=await axios.post(`${serverUrl}/api/auth/google`,{
                idToken
            },{withCredentials:true})
            dispatch(setUserData(data))
            onClose()
        } catch (error) {
            await signOut(auth).catch(()=>{})
            setAuthError(getAuthErrorMessage(error))
        } finally {
            setIsSigningIn(false)
        }
    }
    return (
        <AnimatePresence>
            {open &&
                <Motion.div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='login-title'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >

                    <Motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 60 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-transparent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='relative rounded-3xl bg-[#0b0b0b] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden' >
                            <Motion.div
                                animate={{ opacity: [0.25, 0.4, 0.25] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]"
                            />
                            <Motion.div
                                animate={{ opacity: [0.2, 0.35, 0.2] }}
                                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                                className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/25 blur-[140px]"
                            />

                            <button
                                type='button'
                                aria-label='Close login'
                                className='absolute top-5 right-5 z-20 text-zinc-400 hover:text-white transition text-lg'
                                onClick={onClose}
                            >
                                X
                            </button>


                            <div className='relative px-8 pt-14 pb-10 text-center'>
                                <h1 className='inline-block mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300'> AI-powered website builder </h1>
                                <h2 id='login-title' className='text-3xl font-semibold leading-tight mb-3 space-x-2'>
                                    <span >Welcome to</span>
                                    <span className='bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>Velora.AI</span>
                                </h2>

                                <Motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleGoogleAuth}
                                    disabled={isSigningIn}
                                    className="group relative w-full h-13 rounded-xl bg-white text-black font-semibold shadow-xl overflow-hidden disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <div className='relative flex items-center justify-center gap-3'>
                                        <img src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" alt="" className='h-5 w-5' />
                                        {isSigningIn ? "Signing in..." : "Continue with Google"}
                                    </div>

                                </Motion.button>

                                {authError && (
                                    <p className='mt-4 text-sm text-red-400' role='alert'>
                                        {authError}
                                    </p>
                                )}

                                <div className='flex items-center gap-4 my-10'>
                                    <div className='h-px flex-1 bg-white/10' />
                                    <span className='text-xs text-zinc-500 tracking-wide'>Secure Login</span>
                                    <div className='h-px flex-1 bg-white/10' />
                                </div>

                                <p className='text-xs text-zinc-500 leading-relaxed'>
                                    By continuing, you agree to our{" "}
                                    <span className="underline cursor-pointer hover:text-zinc-300">
                                        Terms of Service
                                    </span>{" "}
                                    and{" "}
                                    <span className="underline cursor-pointer hover:text-zinc-300">
                                        Privacy Policy
                                    </span>.
                                </p>

                            </div>


                        </div>
                    </Motion.div>

                </Motion.div>}
        </AnimatePresence>
    )
}

export default LoginModal
