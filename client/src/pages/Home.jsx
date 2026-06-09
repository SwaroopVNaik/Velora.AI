import React, { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion as Motion } from "motion/react"
import { useDispatch, useSelector } from 'react-redux'
import { Code2, Coins, LayoutTemplate, Rocket } from "lucide-react"
import { serverUrl } from '../config'
import axios from 'axios'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

const LoginModal=lazy(()=>import('../components/LoginModal'))

const gridVariants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.12,
            staggerChildren: 0.12
        }
    }
}

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 32,
        scale: 0.96
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1]
        }
    }
}

function Home() {

    const highlights = [
        {
            title: "AI Generated Code",
            description: "Turn a clear idea into a complete website with clean HTML, CSS, and JavaScript.",
            icon: Code2,
            accent: "from-purple-500/20 to-purple-500/0"
        },
        {
            title: "Responsive by Default",
            description: "Every layout adapts smoothly across mobile, tablet, and desktop screens.",
            icon: LayoutTemplate,
            accent: "from-blue-500/20 to-blue-500/0"
        },
        {
            title: "Ready to Publish",
            description: "Edit, preview, and deploy your generated website from one simple workspace.",
            icon: Rocket,
            accent: "from-cyan-500/20 to-cyan-500/0"
        },
    ]

    const [openLogin, setOpenLogin] = useState(false)
    const { userData } = useSelector(state => state.user)
    const [openProfile, setOpenProfile] = useState(false)
    const [websites, setWebsites] = useState(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const handleLogOut = async () => {
        try {
            await axios.post(`${serverUrl}/api/auth/logout`, {}, { withCredentials: true })
        } catch {
            // Local logout still completes if the API is temporarily unavailable.
        } finally {
            const [{signOut},{auth}]=await Promise.all([
                import('firebase/auth'),
                import('../firebase')
            ])
            await signOut(auth).catch(()=>{})
            dispatch(setUserData(null))
            setOpenProfile(false)
            setWebsites(null)
        }
    }

    useEffect(() => {
        if (!userData) return;
        const handleGetAllWebsites = async () => {

            try {

                const result = await axios.get(`${serverUrl}/api/website/get-all`, { withCredentials: true })
                setWebsites(result.data || [])

            } catch {
                setWebsites([])
            }
        }
        handleGetAllWebsites()
    }, [userData])
    return (
        <div className='relative min-h-screen bg-[#040404] text-white overflow-x-clip flex flex-col'>
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='absolute left-1/2 top-20 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[140px]' />
                <div className='absolute right-[-10rem] top-[28rem] h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]' />
            </div>

            <Motion.div
                initial={{ y: -40 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className='fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10'
            >
                <div className='max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center'>
                    <div className='text-lg font-semibold'>
                        Velora.AI
                    </div>
                    <div className='flex items-center gap-5'>
                        <button type='button' className='hidden md:inline text-sm text-zinc-400 hover:text-white cursor-pointer' onClick={() => navigate("/pricing")}>
                            Pricing
                        </button>
                        {userData && <button type='button' className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm cursor-pointer hover:bg-white/10 transition' onClick={() => navigate("/pricing")}>
                            <Coins size={14} className='text-yellow-400' />
                            <span className='text-zinc-300'>Credits</span>
                            <span>{userData.credits}</span>
                            <span className='font-semibold'>+</span>
                        </button>}


                        {!userData ? <button className='px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-sm'
                            onClick={() => setOpenLogin(true)}
                        >

                            

                            Get Started
                        </button>
                            :
                            <div className='relative'>
                                <button className='flex items-center' onClick={() => setOpenProfile(!openProfile)}>
                                    <img src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData.name}`} alt="" referrerPolicy='no-referrer' className='w-9 h-9 rounded-full border border-white/20 object-cover' />
                                </button>
                                <AnimatePresence>
                                    {openProfile && (
                                        <>
                                            <Motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-60 z-50 rounded-xl bg-[#0b0b0b] border border-white/10 shadow-2xl overflow-hidden"
                                            >
                                                <div className='px-4 py-3 border-b border-white/10'>
                                                    <p className='text-sm font-medium truncate'>{userData.name}</p>
                                                    <p className='text-xs text-zinc-500 truncate'>{userData.email}</p>
                                                </div>

                                                <button className='md:hidden w-full px-4 py-3 flex items-center gap-2 text-sm border-b border-white/10 hover:bg-white/5'>
                                                    <Coins size={14} className='text-yellow-400' />
                                                    <span className='text-zinc-300'>Credits</span>
                                                    <span>{userData.credits}</span>
                                                    <span className='font-semibold'>+</span>
                                                </button>

                                                <button className='w-full px-4 py-3 text-left text-sm hover:bg-white/5' onClick={() => navigate("/dashboard")}>Dashboard</button>
                                                <button className='w-full px-4 py-3 text-left text-sm hover:bg-white/5' onClick={() => navigate("/payments")}>Payment History</button>
                                                <button className='w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5' onClick={handleLogOut}>Logout</button>

                                            </Motion.div>
                                        </>

                                    )}

                                </AnimatePresence>

                            </div>

                        }

                    </div>
                </div>
            </Motion.div>

            <main className='relative z-10 flex-1'>
                <section className='max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-16 sm:pb-20 text-center'>
                    <Motion.div
                        initial={{ y: 18 }}
                        animate={{ y: 0 }}
                        className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm text-zinc-300'
                    >
                        AI-powered website creation, from prompt to publish
                    </Motion.div>

                    <Motion.h1
                        initial={{ y: 40 }}
                        animate={{ y: 0 }}
                        className="mx-auto mt-7 max-w-5xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.05]"
                    >
                        Build stunning websites
                        <span className='block mt-2 bg-linear-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent'>
                            with AI
                        </span>
                    </Motion.h1>

                    <Motion.p
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className='mt-7 max-w-2xl mx-auto text-zinc-400 text-base sm:text-lg leading-relaxed'
                    >
                        Describe your idea and turn it into a responsive, production-ready website you can edit and publish.
                    </Motion.p>

                    <Motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-9 sm:mt-10 min-w-44 px-8 py-3.5 rounded-xl bg-white text-black font-semibold shadow-[0_12px_50px_rgba(255,255,255,0.14)]"
                        onClick={() => userData ? navigate("/dashboard") : setOpenLogin(true)}
                    >
                        {userData ? "Go to Dashboard" : "Get Started"}
                    </Motion.button>
                </section>

                <section className='max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28'>
                    <Motion.div
                        key={userData?._id || "guest"}
                        variants={gridVariants}
                        initial='hidden'
                        animate='visible'
                        className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6'
                    >
                        {highlights.map((highlight) => {
                            const Icon = highlight.icon

                            return (
                                <Motion.div
                                    key={highlight.title}
                                    variants={cardVariants}
                                    whileHover={{ y: -5 }}
                                    className="relative min-h-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-7"
                                >
                                    <div className={`absolute inset-0 bg-linear-to-br ${highlight.accent}`} />
                                    <div className='relative flex h-full flex-col'>
                                        <div className='mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white'>
                                            <Icon size={20} />
                                        </div>
                                        <h2 className='text-lg font-semibold'>{highlight.title}</h2>
                                        <p className='mt-3 text-sm leading-6 text-zinc-400'>{highlight.description}</p>
                                    </div>
                                </Motion.div>
                            )
                        })}
                    </Motion.div>
                </section>

                {userData && websites?.length > 0 && (
                    <section className='max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28'>
                        <div className='mb-6 flex items-end justify-between gap-4'>
                            <div>
                                <p className='text-sm text-zinc-500'>Continue building</p>
                                <h2 className='mt-1 text-2xl font-semibold'>Your websites</h2>
                            </div>
                            <button className='text-sm text-zinc-400 hover:text-white transition' onClick={() => navigate("/dashboard")}>
                                View all
                            </button>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                            {websites.slice(0, 3).map((w) => (
                                <Motion.div
                                key={w._id}
                                whileHover={{ y: -6 }}
                                onClick={() => navigate(`/editor/${w._id}`)}
                                className="cursor-pointer rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-white/20 transition-colors"
                            >
                                <div className='relative h-44 bg-black overflow-hidden'>
                                    <iframe
                                        title={`Preview of ${w.title}`}
                                        srcDoc={w.latestCode}
                                        sandbox=''
                                        loading='lazy'
                                        className='absolute inset-0 w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white'
                                    />
                                    <div className='absolute inset-0 bg-linear-to-t from-black/40 to-transparent' />
                                </div>
                                <div className='p-5'>
                                    <h3 className='text-base font-semibold line-clamp-2'>{w.title}</h3>
                                    <p className='mt-2 text-xs text-zinc-500'>Last updated {""}
                                        {new Date(w.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                </Motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className='relative z-10 mt-auto border-t border-white/10'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-500'>
                    <span>&copy; {new Date().getFullYear()} Velora.AI</span>
                    <span>Prompt. Build. Publish.</span>
                </div>
            </footer>

            {openLogin && (
                <Suspense fallback={null}>
                    <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
                </Suspense>
            )}

        </div>
    )
}

export default Home
