import React, { lazy, Suspense } from 'react'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom"
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'

const Dashboard=lazy(()=>import('./pages/Dashboard'))
const Generate=lazy(()=>import('./pages/Generate'))
const WebsiteEditor=lazy(()=>import('./pages/Editor'))
const LiveSite=lazy(()=>import('./pages/LiveSite'))
const Pricing=lazy(()=>import('./pages/Pricing'))
const PaymentHistory=lazy(()=>import('./pages/PaymentHistory'))

function PageLoader(){
  return <div className='min-h-screen bg-black text-white flex items-center justify-center'>Loading...</div>
}

function ProtectedRoute({children}){
  const {userData,authLoading}=useSelector(state=>state.user)

  if(authLoading){
    return <PageLoader/>
  }

  return userData ? children : <Navigate to='/' replace/>
}

function App() {
  useGetCurrentUser()
  const {authLoading}=useSelector(state=>state.user)

  if(authLoading){
    return <PageLoader/>
  }

  return (
   <BrowserRouter>
   <Suspense fallback={<PageLoader/>}>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      <Route path='/generate' element={<ProtectedRoute><Generate/></ProtectedRoute>}/>
      <Route path='/editor/:id' element={<ProtectedRoute><WebsiteEditor/></ProtectedRoute>}/>
      <Route path='/site/:id' element={<LiveSite/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/payments' element={<ProtectedRoute><PaymentHistory/></ProtectedRoute>}/>
      <Route path='*' element={<Navigate to='/' replace/>}/>
    </Routes>
   </Suspense>
   </BrowserRouter>
  )
}

export default App
