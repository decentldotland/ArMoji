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

export function getRecordType(record) {
  try {
    const isValidTx = /[a-z0-9_-]{43}/i.test(record);
    const isValidUrl = record.startsWith("https") || record.startsWith("http");
    assert.equal([isValidTx, isValidUrl].includes(true), true);
    const type = isValidUrl ? "url" : "tx";
    return type;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

