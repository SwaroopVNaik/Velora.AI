import axios from "axios"
import { auth } from "./firebase"
import { serverUrl } from "./config"

const apiOrigin = new URL(serverUrl, window.location.origin).origin

axios.defaults.withCredentials = true

axios.interceptors.request.use(async (config) => {
    const requestUrl = new URL(config.url || "", config.baseURL || window.location.origin)

    if(requestUrl.origin !== apiOrigin || !auth.currentUser){
        return config
    }

    try {
        const idToken = await auth.currentUser.getIdToken()
        config.headers.set("Authorization", `Bearer ${idToken}`)
    } catch {
        // Let the API return its normal authentication response.
    }

    return config
})
