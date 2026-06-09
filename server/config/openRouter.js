import "./env.js"

const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const defaultModels = [
    "qwen/qwen3-coder:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "openai/gpt-oss-120b:free"
]
const requestTimeoutMs = 180_000

export const generateResponse = async (prompt,options={}) => {
    const apiKey = process.env.OPENROUTER_API_KEY
    const configuredModels=(process.env.OPENROUTER_MODELS || process.env.OPENROUTER_MODEL || "")
        .split(",")
        .map((model)=>model.trim())
        .filter(Boolean)
    const models=options.models || (configuredModels.length ? configuredModels : defaultModels)
    const responseFormat=options.responseFormat

    if(!apiKey){
        throw new Error("OPENROUTER_API_KEY is not configured")
    }

    const res = await fetch(openRouterUrl, {
        method: 'POST',
        signal:AbortSignal.timeout(options.timeoutMs || requestTimeoutMs),
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || "http://localhost:5173",
            'X-Title': "Velora.AI"
        },
        body: JSON.stringify({
            models,
            messages: [
                {
                    role: "system",
                    content: "You are Velora.AI's senior web designer and frontend engineer. Follow the user's brief precisely and return only the requested JSON object."
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens:options.maxTokens || 20_000,
            temperature:options.temperature ?? 0.5,
            top_p:options.topP ?? 0.9,
            ...(responseFormat ? {response_format:responseFormat} : {}),
            provider:{
                allow_fallbacks:true,
                ...(responseFormat ? {require_parameters:true} : {})
            }
        }),
    });

if(!res.ok){
    const error=new Error(`OpenRouter request failed with status ${res.status}`)
    error.statusCode=502
    throw error
}

const data=await res.json()
const content=data.choices?.[0]?.message?.content

if(!content){
    const error=new Error("OpenRouter returned an empty response")
    error.statusCode=502
    throw error
}

return content

}
