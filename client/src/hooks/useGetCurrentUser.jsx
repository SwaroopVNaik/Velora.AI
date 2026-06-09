import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../config'
import { useDispatch } from 'react-redux'
import { setAuthLoading, setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
    const dispatch=useDispatch()
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
              const result=await axios.get(`${serverUrl}/api/user/me`,{withCredentials:true})
              dispatch(setUserData(result.data))
            } catch {
              dispatch(setUserData(null))
            } finally {
              dispatch(setAuthLoading(false))
            }
        }
        getCurrentUser()
    }, [dispatch])
}

export default useGetCurrentUser
