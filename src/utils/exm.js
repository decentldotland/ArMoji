import { ARMOJI_CONTRACT_ADDRESS } from "./constants.js";
import axios from "axios";
import assert from "node:assert";

async function readContract() {
  try {
    return (
      await axios.get(`https://api.exm.dev/read/${ARMOJI_CONTRACT_ADDRESS}`)
    )?.data;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function getRecordOfArmojis(code_points) {
  try {
    const armojiRecords = (await readContract())?.records;
    const record = armojiRecords.find(
      (entry) => JSON.stringify(code_points) in entry.records
    );
    console.log(record);
    const txid = record?.records?.[JSON.stringify(code_points)];
    assert.equal(!!txid, true);
    return txid;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getRecordValue(txid) {
  try {
    const tx = await axios.get(`https://arweave.net/${txid}`, {
      responseType: "arraybuffer",
    });
    return tx;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
