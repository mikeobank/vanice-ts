export const getPositionalArg = (args: typeof Deno.args, index = 0): string | undefined  => {
  const positionalArgs = args.filter(arg => arg.startsWith("--") === false)
  return positionalArgs[index]?.trim()

}
export const getArgByName = (name: string, args: typeof Deno.args, defaultValue?: string): string | undefined => {
  return args.find(arg => arg.startsWith(`--${ name }=`))?.replace(`--${ name }=`, "").trim() ?? defaultValue
}

