import characters from "../characters.json" with { type: "json" }

const primeChars = characters.reduce((acc, cur) => `${ acc }${ cur.prime }`, "")
const regex = new RegExp(`^[${ primeChars }]+$`)

export default (str: string) => {
  return regex.test(str)
}