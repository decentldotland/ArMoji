import express from "express";
import cors from "cors";
import axios from "axios";
import emojiUnicode from "emoji-unicode";
import punycode from "punycode";
import { validateCodePoints } from "./utils/emoji.js";
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
    const armoji = req.headers.host?.split(".")?.[0];

    res
      .status(301)
      .redirect(`http://arweave.bio/${punycode.toUnicode(armoji)}`);
    res.end();
  } catch (error) {
    console.log(error);
    res.end();
  }
});

app.get("/:emojis?", async (req, res) => {
  try {
    const armoji = emojiUnicode(req.params.emojis).split(" ");
    const recordTx = await getRecordOfArmojis(armoji);
    const content = await getRecordValue(recordTx);
    res.setHeader("Content-Type", Object.values(content?.headers)?.[0]);
    res.send(Buffer.from(content?.data, "binary"));
    res.end();
  } catch (error) {
    console.log(error);
    res.status(301).redirect(`https://ans.gg`);
    res.end();
  }
});

app.listen(port, async () => {
  console.log(`listening at PORT: ${port}`);
});
