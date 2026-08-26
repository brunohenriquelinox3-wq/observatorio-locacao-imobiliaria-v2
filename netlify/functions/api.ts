import { type Handler } from "@netlify/functions";
import serverless from "serverless-http";
import { createApp } from "../../server/app";

/**
 * Adaptador de produção Netlify. O Express não sobe como processo persistente:
 * cada invocação usa este handler serverless e os redirects preservam /api/*.
 */
const app = createApp();

export const handler = serverless(app) as unknown as Handler;
