import type { PageConfig, NextApiHandler } from "next";

export const config: PageConfig = {
  runtime: "edge",
};

const handler: NextApiHandler = async (req) => {
  return await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: req.body,
  });
};

export default handler;
