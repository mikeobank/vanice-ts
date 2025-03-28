import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts"
import isPrime from "../../src/lib/isPrime.ts"

Deno.test("isPrime - valid prime string", () => {
  assertEquals(isPrime("VAN1CE"), true)
})

Deno.test("isPrime - partially valid prime string", () => {
  assertEquals(isPrime("vanice"), false)
})

Deno.test("isPrime - empty string", () => {
  assertEquals(isPrime("VANICE"), false)
})
