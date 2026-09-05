import type { Express, RequestHandler } from "express";
import multer from "multer";
import { resolveRequestIdentity } from "./_core/context";
import { attestSupabaseMfa } from "./supabaseIdentity";
import { storeSubdivisionDevelopmentAttachment } from "./subdivisionDevelopmentAttachment";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const purposeCodePattern = /^[A-Z][A-Z0-9_]{2,79}$/;

type DevelopmentAttachmentRouteDependencies = {
  resolveRequestIdentity: typeof resolveRequestIdentity;
  attestMfa: typeof attestSupabaseMfa;
  storeAttachment: typeof storeSubdivisionDevelopmentAttachment;
};

const defaultDependencies: DevelopmentAttachmentRouteDependencies = {
  resolveRequestIdentity,
  attestMfa: attestSupabaseMfa,
  storeAttachment: storeSubdivisionDevelopmentAttachment,
};

function redactedClientError(res: Parameters<RequestHandler>[1], status: number) {
  res.status(status).json({ error: "DEVELOPMENT_ATTACHMENT_REQUEST_REJECTED" });
}

export function registerSubdivisionDevelopmentAttachmentRoute(app: Express, dependencies = defaultDependencies) {
  const multipart = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: MAX_ATTACHMENT_BYTES, fields: 3, fieldSize: 256 },
    fileFilter: (_req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
  });

  const requireRecentMfa: RequestHandler = async (req, res, next) => {
    try {
      const identity = await dependencies.resolveRequestIdentity(req);
      const mfa = await dependencies.attestMfa(identity.supabaseAccessToken);
      if (!identity.user || !identity.supabaseSubjectId || !mfa || mfa.subjectId !== identity.supabaseSubjectId || mfa.assuranceLevel !== "aal2" || mfa.method !== "totp") {
        redactedClientError(res, 401);
        return;
      }
      res.locals.developmentAttachmentActor = { subjectId: identity.supabaseSubjectId };
      next();
    } catch {
      redactedClientError(res, 401);
    }
  };

  const parseSingleAttachment: RequestHandler = (req, res, next) => {
    multipart.single("attachment")(req, res, error => {
      if (error || !req.file) {
        redactedClientError(res, 400);
        return;
      }
      next();
    });
  };

  app.post("/api/private/subdivision-development-attachments/:attachmentId", requireRecentMfa, parseSingleAttachment, async (req, res) => {
    const attachmentId = req.params.attachmentId;
    const organizationId = typeof req.body.organizationId === "string" ? req.body.organizationId.trim() : "";
    const purposeCode = typeof req.body.purposeCode === "string" ? req.body.purposeCode.trim().toUpperCase() : "";
    const correlationId = typeof req.body.correlationId === "string" ? req.body.correlationId.trim() : "";
    const subjectId = res.locals.developmentAttachmentActor?.subjectId;
    if (!uuidPattern.test(attachmentId) || !uuidPattern.test(organizationId) || !uuidPattern.test(correlationId) || !purposeCodePattern.test(purposeCode) || !subjectId || !req.file) {
      redactedClientError(res, 400);
      return;
    }
    try {
      const result = await dependencies.storeAttachment({ subjectId, organizationId, purposeCode, attachmentId, correlationId, contentType: req.file.mimetype, bytes: req.file.buffer });
      res.status(201).json({ attachmentId: result.attachmentId });
    } catch {
      redactedClientError(res, 403);
    }
  });
}
