import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../config'
import { useDispatch } from 'react-redux'
import { setAuthLoading, setUserData } from '../redux/userSlice'
import { auth } from '../firebase'

function useGetCurrentUser() {
    const dispatch=useDispatch()
    useEffect(() => {
        let isActive=true

        const getCurrentUser=async () => {
            try {
              await auth.authStateReady()
              if(!isActive){
                return
              }

              if(!auth.currentUser){
                dispatch(setUserData(null))
                return
              }

              const result=await axios.get(`${serverUrl}/api/user/me`,{withCredentials:true})
              if(isActive){
                dispatch(setUserData(result.data))
              }
            } catch {
              if(isActive){
                dispatch(setUserData(null))
              }
            } finally {
              if(isActive){
                dispatch(setAuthLoading(false))
              }
            }
        }

        getCurrentUser()
        return () => {isActive=false}
    }, [dispatch])
}

export default useGetCurrentUser
