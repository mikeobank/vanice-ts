import characters from "../characters.json" with { type: "json" }

const vanityChars = characters.reduce((acc, cur) => `${ acc }${ cur.prime }${ cur.secondary }`, "")
const regex = new RegExp(`^[${ vanityChars }]+$`)

export default (str: string) => {
  return regex.test(str)
}