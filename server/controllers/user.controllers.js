export const getCurrentUser=async (req,res)=>{
    try {
        return res.json(req.user || null)
    } catch {
        return res.status(500).json({message:"Unable to get current user"})
    }
}
