import { generateResponse } from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractJson from "../utils/extractJson.js";
import mongoose from "mongoose";

const verifiedUnsplashImages=[
    ["wellness products and spa details","1540555700478-4be289fbecef"],
    ["Ayurvedic oil massage","1544161515-4ab6ce6db874"],
    ["hot stone spa treatment","1600334089648-b0d9d3028eb2"],
    ["tropical yoga and meditation","1506126613408-eca07ce68773"],
    ["restaurant interior","1517248135467-4c7edcad34c4"],
    ["coffee and cafe","1495474472287-4d71bcdd2085"],
    ["food and healthy ingredients","1498837167922-ddd27525d352"],
    ["modern home and real estate","1600585154340-be6161a56a0c"],
    ["architecture and creative workspace","1497366811353-6870744d04b2"],
    ["fashion and clothing","1445205170230-053b83016050"],
    ["technology and electronics","1518770660439-4636190af475"],
    ["business team collaboration","1521737711867-e3b97375f902"],
    ["fitness and gym","1534438327276-14e5300c3a48"],
    ["product and ecommerce","1523275335684-37898b6baf30"],
    ["travel and tropical beach","1507525428034-b723cf961d3e"],
    ["education and classroom","1509062522246-3755977927d7"],
    ["live music and events","1501386761578-eac5c94b800a"]
]
const verifiedUnsplashIds=new Set(verifiedUnsplashImages.map(([,id])=>id))
const verifiedImageCatalog=verifiedUnsplashImages
    .map(([subject,id])=>`- ${subject}: https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=85`)
    .join("\n")

const masterPrompt = `
Create a distinctive, polished website that follows the user's brief exactly.

USER BRIEF
<user_brief>
{USER_PROMPT}
</user_brief>

BRIEF FIDELITY
- Treat the user brief as the source of truth for website type, audience,
  brand name, content, colors, tone, sections, features, and calls to action.
- Do not force a generic template or unrelated pages.
- If the user asks for one landing page, build one excellent landing page.
- If the user requests multiple pages, implement them as an in-document SPA.
- Preserve supplied wording and facts. Do not invent conflicting details.
- When details are missing, infer choices appropriate to that exact industry.

DESIGN DIRECTION
- First reason privately about the audience, goal, visual identity, information
  hierarchy, and primary conversion action. Do not output that reasoning.
- Create a specific visual concept for this brief, not a generic AI website.
- Avoid repetitive purple-gradient SaaS styling unless the brief requests it.
- Avoid a plain centered heading floating inside a large empty solid-color hero.
- Give the first screen a strong visual focal point using an editorial grid,
  relevant photography, layered shapes, typography, or purposeful asymmetry.
- Use a coherent design system with CSS variables, intentional spacing,
  strong typography, clear hierarchy, and restrained animation.
- Add visual depth through section rhythm, borders, surfaces, image crops,
  subtle texture, and varied composition without making the design cluttered.
- Include domain-specific content instead of lorem ipsum or vague filler.
- For visual industries such as hospitality, wellness, food, travel, fashion,
  architecture, fitness, and real estate, use 3-6 relevant images from
  images.unsplash.com with auto=format&fit=crop&w=1600&q=85.
- For products or technical sites, use polished CSS or inline SVG visuals when
  photography is not appropriate.
- Never invent an Unsplash photo ID. Use only a matching URL from this verified
  catalog, or use CSS/inline SVG when none matches:
${verifiedImageCatalog}
- Inline SVG icons are allowed. Do not use emoji as interface icons.

RESPONSIVE AND ACCESSIBLE
- Build mobile-first for mobile, tablet, and desktop.
- Include the viewport meta tag and meaningful media queries.
- Prevent horizontal overflow and keep controls touch-friendly.
- Use semantic HTML, visible focus states, labels, useful alt text, and
  sufficient contrast.

IMPLEMENTATION
- Return one complete HTML5 document with embedded CSS and JavaScript.
- Use no frameworks, external JavaScript, external CSS, or external fonts.
- Every visible control must work. Do not include dead buttons or fake links.
- Add JavaScript only where interaction is useful.
- If navigation is hidden on mobile, provide a visible, accessible menu button
  that opens and closes it. Never simply remove navigation on small screens.
- The first screen must be fully visible without user interaction.
- Do not access parent frames, cookies, localStorage, or browser credentials.

QUALITY CHECK BEFORE RESPONDING
- The result clearly matches the user's requested business and visual style.
- The hero, copy, sections, and calls to action are specific to the brief.
- The layout has no clipped, empty, overlapping, or permanently hidden content.
- Navigation and interactions work at all target screen sizes.
- The HTML document is complete and not truncated.

Return raw JSON only, with no markdown or surrounding explanation:
{
  "message": "One short confirmation sentence",
  "code": "<the complete HTML document>"
}
`;

const designPlanPrompt=(userPrompt)=>`
Create a concise visual and content blueprint for a website from this brief:

<user_brief>
${userPrompt}
</user_brief>

Return JSON only with these fields:
{
  "siteType": "specific website type",
  "audience": "primary audience",
  "primaryGoal": "main conversion goal",
  "visualConcept": "distinctive visual concept in 2-3 sentences",
  "palette": ["4-6 specific color names or hex values"],
  "layoutDirection": "hero and page composition",
  "sections": [
    {"name": "section name", "purpose": "specific content and role"}
  ],
  "imageDirection": "subjects, framing, mood, and where imagery should appear",
  "interactions": ["only interactions useful for this brief"],
  "avoid": ["generic or conflicting design choices to avoid"]
}

Follow explicit user details exactly. Do not default to a generic SaaS layout.
`

const MAX_PROMPT_LENGTH=4000
const MAX_GENERATED_CODE_LENGTH=2_000_000
const MIN_GENERATED_CODE_LENGTH=2500

const normalizePrompt=(value)=>{
    if(typeof value !== "string"){
        return null
    }

    const prompt=value.trim()
    if(!prompt || prompt.length > MAX_PROMPT_LENGTH){
        return null
    }

    return prompt
}

const getQualityIssues=(code,userPrompt,{validateImages=true}={})=>{
    const issues=[]
    const explicitMobileMenu=/\b(mobile menu|mobile navigation|hamburger menu)\b/i.test(userPrompt)
    const hasMobileMenu=/aria-expanded|hamburger|(?:menu|nav)[-_ ]?(?:toggle|button|btn)/i.test(code)
    const forbidsPurple=/\b(?:no|avoid|without|do not use)\b[^.\n]{0,40}\bpurple\b/i.test(userPrompt)
    const usesPurple=/\bpurple\b|#(?:8b5cf6|7c3aed|a855f7|9333ea|a78bfa|c084fc)\b/i.test(code)
    const visualIndustry=/\b(wellness|spa|ayurved|hotel|resort|restaurant|cafe|food|travel|tour|fashion|beauty|fitness|gym|real estate|architecture)\b/i.test(userPrompt)
    const forbidsImages=/\b(no images|without images|no photography)\b/i.test(userPrompt)
    const imageCount=(code.match(/<img\b/gi) || []).length

    if(explicitMobileMenu && !hasMobileMenu){
        issues.push("The user explicitly requested a working mobile menu.")
    }
    if(forbidsPurple && usesPurple){
        issues.push("The user explicitly requested that purple not be used.")
    }
    if(visualIndustry && !forbidsImages && imageCount < 2){
        issues.push("This visual industry needs at least two relevant catalog images.")
    }

    if(validateImages){
        const usedIds=[...code.matchAll(/images\.unsplash\.com\/photo-([^?'"()\s]+)/gi)]
            .map((match)=>match[1])
        const unknownIds=usedIds.filter((id)=>{
            return !verifiedUnsplashIds.has(id) && !userPrompt.includes(id)
        })
        if(unknownIds.length){
            issues.push("One or more image URLs use unverified or invented Unsplash IDs.")
        }
    }

    return issues
}

const parseGeneratedWebsite=async (prompt,userPrompt,options={})=>{
    let qualityIssues=[]
    for(let attempt=0;attempt<2;attempt++){
        const suffix=attempt === 0
            ? ""
            : `\n\nYour previous output was invalid or incomplete. Fix these issues:
- ${qualityIssues.join("\n- ") || "Return a complete, high-detail HTML document inside the required raw JSON object."}`
        const raw=await generateResponse(prompt+suffix,options.generationOptions)
        const parsed=extractJson(raw)
        const code=typeof parsed?.code === "string" ? parsed.code.trim() : ""
        const isCompleteDocument=
            code.length >= MIN_GENERATED_CODE_LENGTH &&
            code.length <= MAX_GENERATED_CODE_LENGTH &&
            /<!doctype html>/i.test(code) &&
            /<meta[^>]+name=["']viewport["']/i.test(code) &&
            /<style[\s>]/i.test(code) &&
            /@media/i.test(code) &&
            /<\/body>/i.test(code) &&
            /<\/html>/i.test(code)
        qualityIssues=isCompleteDocument
            ? getQualityIssues(code,userPrompt,options)
            : ["The HTML document was incomplete, too short, or missing responsive structure."]

        if(isCompleteDocument && qualityIssues.length === 0){
            return {
                code,
                message:typeof parsed.message === "string" && parsed.message.trim()
                    ? parsed.message.trim().slice(0,10000)
                    : "Website generated successfully."
            }
        }
    }

    const error=new Error("AI returned an invalid response")
    error.statusCode=502
    throw error
}

const reserveCredits=(userId,cost)=>{
    return User.findOneAndUpdate(
        {_id:userId,credits:{$gte:cost}},
        {$inc:{credits:-cost}},
        {new:true,runValidators:true}
    )
}

const refundCredits=(userId,cost)=>{
    return User.updateOne({_id:userId},{$inc:{credits:cost}})
}

const invalidId=(id)=>!mongoose.isValidObjectId(id)
export const createWebsiteDesignPlan=async (userPrompt)=>{
    try {
        const raw=await generateResponse(designPlanPrompt(userPrompt),{
            models:["qwen/qwen3-next-80b-a3b-instruct:free"],
            maxTokens:1800,
            temperature:0.35,
            timeoutMs:60_000,
            responseFormat:{type:"json_object"}
        })
        return extractJson(raw)
    } catch {
        return null
    }
}

export const buildWebsitePrompt=(userPrompt,designPlan)=>{
    const prompt=masterPrompt.replace("{USER_PROMPT}",userPrompt)
    if(!designPlan){
        return prompt
    }

    return `${prompt}

DESIGN BLUEPRINT
The following blueprint was derived from the user brief. Use it to improve
specificity and composition. The original user brief wins if anything conflicts.
<design_blueprint>
    ${JSON.stringify(designPlan)}
</design_blueprint>`
}

export const generateWebsiteFromBrief=async (userPrompt)=>{
    const designPlan=await createWebsiteDesignPlan(userPrompt)
    const finalPrompt=buildWebsitePrompt(userPrompt,designPlan)
    return parseGeneratedWebsite(finalPrompt,userPrompt)
}


export const generateWebsite = async (req, res) => {
    let creditsReserved=false
    try {
        const prompt=normalizePrompt(req.body.prompt)
        if (!prompt) {
            return res.status(400).json({
                message:`Prompt must be between 1 and ${MAX_PROMPT_LENGTH} characters`
            })
        }

        const user=await reserveCredits(req.user._id,50)
        if (!user) {
            return res.status(402).json({ message: "You need at least 50 credits to generate a website" })
        }
        creditsReserved=true

        const parsed=await generateWebsiteFromBrief(prompt)

        const website = await Website.create({
            user: user._id,
            title: prompt.slice(0, 60),
            latestCode: parsed.code,
            conversation: [
                {
                    role: "user",
                    content: prompt
                },
                {
                    role: "ai",
                    content: parsed.message
                }
                
            ]
        })

        creditsReserved=false

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits
        })

    } catch (error) {
        if(creditsReserved){
            await refundCredits(req.user._id,50).catch(()=>{})
        }

        return res.status(error.statusCode || 500).json({
            message:error.statusCode ? error.message : "Unable to generate website"
        })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        if(invalidId(req.params.id)){
            return res.status(400).json({message:"Invalid website ID"})
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(404).json({ message: "Website not found" })
        }
        return res.status(200).json(website)
    } catch {
        return res.status(500).json({ message: "Unable to load website" })
    }
}


export const changes = async (req, res) => {
    let creditsReserved=false
    try {
        const prompt=normalizePrompt(req.body.prompt)
        if (!prompt) {
            return res.status(400).json({
                message:`Prompt must be between 1 and ${MAX_PROMPT_LENGTH} characters`
            })
        }

        if(invalidId(req.params.id)){
            return res.status(400).json({message:"Invalid website ID"})
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(404).json({ message: "Website not found" })
        }

        const user=await reserveCredits(req.user._id,25)
        if (!user) {
            return res.status(402).json({ message: "You need at least 25 credits to update a website" })
        }
        creditsReserved=true

        const updatePrompt = `
Act as a senior frontend engineer editing an existing website.

USER'S CHANGE REQUEST
<change_request>
${prompt}
</change_request>

CURRENT COMPLETE HTML
<current_html>
${website.latestCode}
</current_html>

Apply the requested change precisely while preserving all unrelated content,
styling, responsiveness, and working behavior. Integrate the change naturally
with the existing design system instead of rebuilding the site generically.
Fix any nearby responsive or accessibility issue caused by the change.
Do not expand, rewrite, or add unrelated sections. Keep the output concise while
returning the complete document.

Return the entire updated HTML document, not a patch or excerpt.
Return raw JSON only:
{
  "message": "One short description of the completed change",
  "code": "<the complete updated HTML document>"
}
`
        const updateMaxTokens=Math.min(
            20_000,
            Math.max(6_000,Math.ceil(website.latestCode.length / 3) + 1_200)
        )
        const parsed=await parseGeneratedWebsite(updatePrompt,prompt,{
            validateImages:false,
            generationOptions:{
                maxTokens:updateMaxTokens,
                temperature:0.3
            }
        })


        website.conversation.push(
            { role: "user", content: prompt },
            { role: "ai", content: parsed.message },
        )

        website.latestCode = parsed.code

        await website.save()
        creditsReserved=false

        return res.status(200).json({
            message:parsed.message,
            code:parsed.code,
            remainingCredits: user.credits
        })


    } catch (error) {
        if(creditsReserved){
            await refundCredits(req.user._id,25).catch(()=>{})
        }

        return res.status(error.statusCode || 500).json({
            message:error.statusCode ? error.message : "Unable to update website"
        })
    }
}



export const getAll=async (req,res) => {
    try {
        const websites=await Website.find({user:req.user._id})
            .select("title latestCode deployed deployUrl slug updatedAt")
            .sort({updatedAt:-1})
            .lean()
        return res.status(200).json(websites)
    } catch {
        return res.status(500).json({ message: "Unable to load websites" })
    }
}

export const deleteWebsite=async (req,res) => {
    try {
        if(invalidId(req.params.id)){
            return res.status(400).json({message:"Invalid website ID"})
        }

        const website=await Website.findOneAndDelete({
            _id:req.params.id,
            user:req.user._id
        })

        if(!website){
            return res.status(404).json({message:"website not found"})
        }

        return res.status(200).json({message:"website deleted successfully"})
    } catch {
        return res.status(500).json({message:"Unable to delete website"})
    }
}


export const deploy=async (req,res)=>{
    try {
         if(invalidId(req.params.id)){
            return res.status(400).json({message:"Invalid website ID"})
         }

         const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(404).json({ message: "Website not found" })
        }

        if(!website.slug){
            website.slug=website.title.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,60)+website._id.toString().slice(-5)              
        }

        website.deployed=true
        const frontendUrl=(process.env.FRONTEND_URL || "http://localhost:5173")
            .split(",")[0]
            .trim()
            .replace(/\/$/,"")
        website.deployUrl=`${frontendUrl}/site/${website.slug}`
        await website.save()

        return res.status(200).json({
            url:website.deployUrl
        })

    } catch {
         return res.status(500).json({ message: "Unable to deploy website" })
    }
}


export const getBySlug=async (req,res) => {
    try {
         const website = await Website.findOne({
            slug: req.params.slug,
            deployed:true
        }).select("title latestCode updatedAt").lean()

        if (!website) {
            return res.status(404).json({ message: "Website not found" })
        }
          return res.status(200).json(website)
    } catch {
        return res.status(500).json({ message: "Unable to load website" })
    }
}
