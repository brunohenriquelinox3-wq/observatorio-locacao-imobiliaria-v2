import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { registerPrivateBuyerAttachmentRoute } from "./subdivisionBuyerAttachmentRoute";
import { registerPrivateSaleCaseDossierAttachmentRoute } from "./subdivisionSaleCaseDossierAttachmentRoute";
import { registerSubdivisionDevelopmentAttachmentRoute } from "./subdivisionDevelopmentAttachmentRoute";
import { handleSubdivisionInternalReceivableAlertSchedule } from "./subdivisionInternalReceivableAlertSchedule";

/**
 * Cria somente as rotas de aplicação compartilhadas entre o servidor local e
 * a Function serverless. A entrega de Vite/arquivos estáticos fica fora daqui,
 * pois no Netlify ela é responsabilidade do CDN e dos redirects declarados.
 */
export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerPrivateBuyerAttachmentRoute(app);
  registerPrivateSaleCaseDossierAttachmentRoute(app);
  registerSubdivisionDevelopmentAttachmentRoute(app);
  app.post("/api/scheduled/subdivision-internal-receivable-attention", handleSubdivisionInternalReceivableAlertSchedule);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
