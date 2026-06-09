const extractJson = (text) => {
    if (!text) {
        return
    }
    const cleaned = text.
         replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

        const firstBrace=cleaned.indexOf('{')
        const closeBrace=cleaned.lastIndexOf('}')
        if(firstBrace===-1 || closeBrace==-1)return null
        const jsonString=cleaned.slice(firstBrace,closeBrace+1)
        try {
            return JSON.parse(jsonString)
        } catch {
            return null
        }

}
export default extractJson
