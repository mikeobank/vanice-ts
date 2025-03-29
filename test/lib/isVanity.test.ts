import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts"
import isVanity from "../../src/lib/isVanity.ts"

Deno.test("isVanity - prime string", () => {
  assertEquals(isVanity("VAN1CE"), true)
})

Deno.test("isVanity - vanity string", () => {
  assertEquals(isVanity("Vanice"), true)
})

Deno.test("isVanity - non vanity string", () => {
  assertEquals(isVanity("@Va"), false)
})