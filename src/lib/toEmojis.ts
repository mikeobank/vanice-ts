import characters from "../characters.json" with { type: "json" }
import { type Prime, Emojis } from "./toVanityKey.ts"

export default (str: Prime) : Emojis => {
  const regexes: [RegExp, string][] = characters
    .map(({ prime, emoji }) => [new RegExp(`[${ prime }]`, "g"), emoji])
  return regexes.reduce((acc, cur) => {
    const [regex, char] = cur
    return acc.replace(regex, char)
  }, str)
}