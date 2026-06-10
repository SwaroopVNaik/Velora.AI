import axios from "axios"
import { auth } from "./firebase"
import { serverUrl } from "./config"

const apiOrigin = new URL(serverUrl, window.location.origin).origin

axios.defaults.withCredentials = true

const isApiRequest = (config) => {
    const requestUrl = new URL(config.url || "", config.baseURL || window.location.origin)
    return requestUrl.origin === apiOrigin
}

const attachFirebaseToken = async (config,forceRefresh=false) => {
    await auth.authStateReady()

    if(!auth.currentUser){
        return false
    }

    const idToken = await auth.currentUser.getIdToken(forceRefresh)
    config.headers = axios.AxiosHeaders.from(config.headers)
    config.headers.set("Authorization", `Bearer ${idToken}`)
    return true
}

axios.interceptors.request.use(async (config) => {
    if(!isApiRequest(config)){
        return config
    }

    try {
        await attachFirebaseToken(config)
    } catch {
        // Let the API return its normal authentication response.
    }

    return config
})

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config=error.config

        if(
            error.response?.status !== 401 ||
            !config ||
            config.firebaseAuthRetried ||
            !isApiRequest(config)
        ){
            return Promise.reject(error)
        }

        config.firebaseAuthRetried=true

        try {
            const tokenAttached=await attachFirebaseToken(config,true)
            if(tokenAttached){
                return axios(config)
            }
        } catch {
            // Return the original API error when Firebase cannot refresh.
        }

        return Promise.reject(error)
    }
)
