import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../config'
import { useState } from 'react'
import { ArrowLeft, Code2, LoaderCircle, MessageSquare, Monitor, Rocket, Send, X } from 'lucide-react'
import { useRef } from 'react'
import { AnimatePresence, motion as Motion } from 'motion/react'

import Editor from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const thinkingSteps = [
    { after: 0, label: "Reading your request..." },
    { after: 8, label: "Finding the sections to update..." },
    { after: 20, label: "Applying the design and code changes..." },
    { after: 45, label: "Checking responsiveness and interactions..." },
    { after: 75, label: "Finishing the updated website..." },
]

function UpdateProgress({ elapsed }) {
    const currentStep = [...thinkingSteps]
        .reverse()
        .find((step) => elapsed >= step.after) || thinkingSteps[0]
    const elapsedLabel = elapsed >= 60
        ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`
        : `${elapsed}s`

    return (
        <div
            role='status'
            aria-live='polite'
            className='max-w-[90%] mr-auto px-4 py-3 rounded-2xl bg-white/5 border border-white/10'
        >
            <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-2 text-sm text-white'>
                    <LoaderCircle size={15} className='animate-spin text-indigo-400' />
                    <span className='font-medium'>Updating website</span>
                </div>
                <span className='text-[11px] tabular-nums text-zinc-500'>{elapsedLabel}</span>
            </div>
            <p className='mt-2 text-xs text-zinc-300'>{currentStep.label}</p>
            <div className='mt-3 h-1 overflow-hidden rounded-full bg-white/10'>
                <Motion.div
                    className='h-full w-1/3 rounded-full bg-linear-to-r from-indigo-500 to-purple-500'
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <p className='mt-2 text-[11px] text-zinc-500'>
                Keep this page open. Larger changes can take up to 1-2 minutes.
            </p>
        </div>
    )
}

function WebsiteEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)
    const [website, setWebsite] = useState(null)
    const [loadError, setLoadError] = useState("")
    const [actionError, setActionError] = useState("")
    const [code, setCode] = useState("")
    const [messages, setMessages] = useState([])
    const [prompt, setPrompt] = useState("")
    const iframeRef = useRef(null)
    const desktopMessagesEndRef = useRef(null)
    const mobileMessagesEndRef = useRef(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [updateElapsed, setUpdateElapsed] = useState(0)
    const [showCode, setShowCode] = useState(false)
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const handleUpdate = async () => {
        if (!prompt.trim() || updateLoading) return
        const text = prompt.trim()
        setUpdateElapsed(0)
        setUpdateLoading(true)
        setActionError("")
        setPrompt("")
        setMessages((m) => [...m, { role: "user", content: text }])
        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: text }, { withCredentials: true })
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
            dispatch(setUserData({
                ...userData,
                credits:result.data.remainingCredits
            }))
        } catch (error) {
            setActionError(error.response?.data?.message || "Unable to update website")
        } finally {
            setUpdateLoading(false)
        }
    }

    const handleDeploy = async () => {
            setActionError("")
            try {
                const result = await axios.post(`${serverUrl}/api/website/deploy/${website._id}`, {}, { withCredentials: true })
                setWebsite((current)=>({...current,deployed:true,deployUrl:result.data.url}))
                window.open(`${result.data.url}`, "_blank")
               
            } catch (error) {
                setActionError(error.response?.data?.message || "Unable to deploy website")
            }
        }


    useEffect(() => {
        if (!updateLoading) return;
        const startedAt = Date.now()
        const timer = setInterval(() => {
            setUpdateElapsed(Math.floor((Date.now() - startedAt) / 1000))
        }, 1000)

        return () => clearInterval(timer)
    }, [updateLoading])

    useEffect(() => {
        const behavior = updateLoading ? "smooth" : "auto"
        desktopMessagesEndRef.current?.scrollIntoView({ behavior })
        mobileMessagesEndRef.current?.scrollIntoView({ behavior })
    }, [messages, updateLoading, updateElapsed, showChat])

    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-id/${id}`, { withCredentials: true })
                setWebsite(result.data)
                setCode(result.data.latestCode)
                setMessages(result.data.conversation)
            } catch (error) {
                setLoadError(error.response?.data?.message || "Unable to load website")
            }
        }
        handleGetWebsite()
    }, [id])


    useEffect(() => {
        if (!iframeRef.current || !code) return;
        const blob = new Blob([code], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        iframeRef.current.src = url
        return () => URL.revokeObjectURL(url)
    }, [code])

    if (loadError) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>
                {loadError}
            </div>
        )
    }
    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-white'>
                Loading...
            </div>
        )
    }



    return (
        <div className='h-screen w-screen flex bg-black text-white overflow-hidden'>
            <aside className='hidden lg:flex w-95 flex-col border-r border-white/10 bg-black/80'>
                <Header />
                <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {updateLoading && <UpdateProgress elapsed={updateElapsed} />}
                        <div ref={desktopMessagesEndRef} />
                    </div>
                    <div className='p-3 border-t border-white/10'>
                        <div className='flex gap-2'>
                            <input disabled={updateLoading} maxLength={4000} placeholder={updateLoading ? 'AI is updating your website...' : 'Describe Changes...'} className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none disabled:opacity-60' onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                            <button aria-label='Send update request' className='px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-50' disabled={updateLoading || !prompt.trim()} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
            </aside>

            <div className='flex-1 flex flex-col'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                    <div className='flex items-center gap-3'>
                        <button
                            type='button'
                            aria-label='Back to dashboard'
                            title='Back to dashboard'
                            className='p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition'
                            onClick={() => navigate("/dashboard")}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <span className='text-xs text-zinc-400'>Live Preview</span>
                            {actionError && <p className='text-xs text-red-400'>{actionError}</p>}
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        {website.deployed ?"": <button className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition'
                        onClick={handleDeploy}
                        ><Rocket size={14} /> Deploy</button>}
                       
                        <button className='p-2 lg:hidden' onClick={() => setShowChat(true)}><MessageSquare size={18} /></button>

                        <button className='p-2' onClick={() => setShowCode(true)}><Code2 size={18} /></button>
                        <button className='p-2' onClick={() => setShowFullPreview(true)}><Monitor size={18} /></button>
                    </div>

                </div>

                <iframe title='Website preview' ref={iframeRef} sandbox='allow-scripts' className='flex-1 w-full bg-white' />
            </div>

            <AnimatePresence>
                {showChat && (
                    <Motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col"
                    >
                   <Header onclose={()=>setShowChat(false)}/>
                   <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {updateLoading && <UpdateProgress elapsed={updateElapsed} />}
                        <div ref={mobileMessagesEndRef} />
                    </div>
                    <div className='p-3 border-t border-white/10'>
                        <div className='flex gap-2'>
                            <input disabled={updateLoading} maxLength={4000} placeholder={updateLoading ? 'AI is updating your website...' : 'Describe Changes...'} className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none disabled:opacity-60' onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                            <button aria-label='Send update request' className='px-4 py-3 rounded-2xl bg-white text-black disabled:opacity-50' disabled={updateLoading || !prompt.trim()} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
                    </Motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showCode && (
                    <Motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] bg-[#1e1e1e] flex flex-col"
                    >
                        <div className='h-12 px-4 flex justify-between items-center border-b border-white/10 bg-[#1e1e1e]'>
                            <span className='text-sm font-medium'>index.html</span>
                            <button onClick={() => setShowCode(false)}><X size={18} /></button>
                        </div>
                        <Editor
                            theme='vs-dark'
                            value={code}
                            language='html'
                            onChange={(v) => setCode(v)}
                        />

                    </Motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (
                    <Motion.div
                        className="fixed inset-0 z-[9999] bg-black"
                    >
                        <iframe title='Full website preview' className='w-full h-full bg-white' srcDoc={code} sandbox='allow-scripts'/>
                        <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg'><X /></button>
                    </Motion.div>
                )}
            </AnimatePresence>


        </div>
    )

    function Header({onclose}) {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-white/10'>
                <span className='font-semibold truncate'>{website.title}</span>
                {onclose &&  <button onClick={onclose}><X size={18} color='white'/></button>}
           
            </div>
        )
    }



}





export default WebsiteEditor
