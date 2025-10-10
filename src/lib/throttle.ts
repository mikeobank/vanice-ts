export default <T extends (...args: never[]) => void>(func: T, limit = 1000): T => {

  let lastExecution = 0
  
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastExecution >= limit) {
      lastExecution = now
      func(...args)
    }
  }) as T
}