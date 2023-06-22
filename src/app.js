import express from "express";
import cors from "cors";
import axios from "axios";
import emojiUnicode from "emoji-unicode";
import punycode from "punycode";
import { validateCodePoints, getRecordType } from "./utils/emoji.js";
import { getRecordOfArmojis, getRecordValue } from "./utils/exm.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);

app.all("/", async (req, res) => {
  try {
    const punnycodes = req.headers.host?.split(".")?.[0];
    const armoji = punycode.toUnicode(punnycodes);
    const record = await getRecordOfArmojis(emojiUnicode(armoji).split(" "));
    const recordType = getRecordType(record);
    if (recordType === "url") {
      res.status(301).redirect(record);
      res.end();
      return;
    }

    res.status(301).redirect(`https://arweave.net/${record}`);
    res.end();
    return;
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.listen(port, async () => {
  console.log(`listening at PORT: ${port}`);
});
