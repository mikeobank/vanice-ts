import characters from "../characters.json" with { type: "json" }

type VanityName = string
type Prime = string

export default (vanity: VanityName) : Prime => {
  const regexes: [RegExp, string][] = characters
    .filter(entry => entry.secondary !== "")
    .map(entry => {
      return [new RegExp(`[${ entry.secondary }]`, "g"), entry.prime]
    })
  
  return regexes.reduce((acc, cur) => {
    const [regex, char] = cur
    return acc.replace(regex, char)
  }, vanity)
}
