import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/app";

const appPromise = createApp({ isDev: false });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { app } = await appPromise;
  app(req, res);
}
