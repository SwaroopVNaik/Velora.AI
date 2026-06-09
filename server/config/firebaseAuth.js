import "./env.js"
import { createRemoteJWKSet, jwtVerify } from "jose"

const projectId=process.env.FIREBASE_PROJECT_ID || "veloraai-ab3e1"
const issuer=`https://securetoken.google.com/${projectId}`
const firebaseKeys=createRemoteJWKSet(
    new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
)

export const verifyFirebaseIdToken=async (idToken)=>{
    const {payload}=await jwtVerify(idToken,firebaseKeys,{
        issuer,
        audience:projectId,
        algorithms:["RS256"]
    })

    if(!payload.sub || payload.sub.length > 128){
        throw new Error("Invalid Firebase subject")
    }

    return {
        uid:payload.sub,
        email:payload.email,
        email_verified:payload.email_verified === true,
        name:payload.name,
        picture:payload.picture
    }
}
