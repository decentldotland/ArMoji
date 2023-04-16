import { SUPPORTED_CODE_POINTS } from "./constants.js";
import assert from "node:assert";

export function codePointToEmoji(codepoint) {
  return String.fromCodePoint(parseInt(codepoint, 16));
}

export function validateCodePoints(code_points) {
  try {
    for (const codepoint of code_points) {
      assert.equal(SUPPORTED_CODE_POINTS.includes(codepoint), true);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
